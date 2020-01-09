import { RotaryEncoder } from "./rotary-encoder";
import { AlarmSwitch } from "./alarm-switch";
import { AudioPlayer } from "./audio";
import { LCD } from "./lcd";
import { Hue } from "./hue";
import { filter, debounceTime, distinctUntilChanged, tap, bufferTime } from "rxjs/operators";
import { parse, addMinutes, format, subMinutes } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { combineLatest } from "rxjs";
import { AlarmMemory } from "./alarm-memory";

console.log("Starting up!");

const defaultAlarmTime = "06:00"; // The default alarm time
const defaultLightAlarmDifference = 30; // The number of minutes the light should turn on before the alarm sound starts
const timeFormat = "HH:mm"; // The time format
const timezone = "Europe/Copenhagen"; // The timezone
const defaultVolume = 60; // The default volume in %
const rotaryEncoderPin1 = 8; // The rotary encoder first input pin
const rotaryEncoderPin2 = 4; // The rotary encoder second input pin
const alarmSwitchPin = 7; // The switch input pin

//Components
const lcd = new LCD();
const memory = new AlarmMemory();
let { alarmTime, alarmVolume } = memory.load();

const aP = new AudioPlayer(alarmVolume);
const aS = new AlarmSwitch(alarmSwitchPin);
const rE = new RotaryEncoder(rotaryEncoderPin1, rotaryEncoderPin2, aS);
const hue = new Hue();

let alarmArmed: boolean; // Is the alarm armed to wake up?
let lightArmed: boolean; // is the light armed to wake up?
let demoTime = false; // Is it time for a demo?
let lastRotaryValue = 0; // Used to determine whether to react on events or not
let clearScreenTimeout; // Used in need of cancelling clear screen timeouts
let lightAlarmTime; // Default to 30 mins before alarmtime to start light sequence

const clearTO = () => {
  if (clearScreenTimeout) {
    clearTimeout(clearScreenTimeout);
  }
};

//Update the alarm time and show it on the LCD screen
function updateAlarmTime(value: number) {
  clearTO();
  // Parse the default alarm time to a new date
  const date = parse(defaultAlarmTime, timeFormat, new Date());
  // Add the rotary encoder's value to the date
  const displayTime = addMinutes(date, (value / 2) * 10);
  // Save and format the current alarm time for future use
  alarmTime = format(displayTime, "HH:mm");
  lightAlarmTime = format(subMinutes(displayTime, 30), "HH:mm");

  lcd.clearScreen(1);

  // Print the current alarm time
  lcd.print({
    message: alarmTime,
    row: 1
  });

  // Clear the bottom part of the screen after 3 seconds
  clearScreenTimeout = setTimeout(() => lcd.clearScreen(1), 3000);
}
//Update the volume and show it on the LCD screen
function updateVolume(value: number) {
  clearTO();
  // Convert the rotary encoder's value to a volume
  const volume = defaultVolume + (value / 2) * 10;
  // Set the audio player's volume
  aP.setVolume(volume);
  alarmVolume = volume;
  lcd.clearScreen(1);

  // Print the volume
  lcd.print({
    message: `Vol: ${volume}%`,
    row: 1
  });

  // Keep the current alarm time on the screen, if any
  lcd.print({
    message: alarmTime ? `${alarmTime}` : " ".repeat(5),
    row: 1,
    column: 11
  });

  // Clear the "Vol: ##%" part of the screen after 3 seconds
  clearScreenTimeout = setTimeout(() => {
    lcd.clearScreen(1, 10);
    memory.saveVolume(alarmVolume);
  }, 3000);
}
//Toggle the alarm on and show it on the LCD screen
function toggleAlarmOn() {
  clearTO();

  lightAlarmTime = format(subMinutes(parse(alarmTime, "HH:mm", new Date()), defaultLightAlarmDifference), "HH:mm");
  // Show confirmation that alarm has been set
  lcd.print({
    message: alarmTime ? ` Alarm kl. ${alarmTime}` : " ".repeat(16),
    row: 1
  });

  lcd.print({
    message: "シ",
    row: 0,
    column: 15
  });

  // Clear the bottom part of screen after 3 seconds
  clearScreenTimeout = setTimeout(() => {
    lcd.clearScreen(1, 10);
    memory.saveTime(alarmTime);
  }, 3000);
}
//Toggle the alarm off and show it on the LCD screen
function toggleAlarmOff() {
  clearTO();
  aP.stop();
  lcd.clearScreen(1);
  // Show confirmation that alarm has been switched off
  lcd.print({
    message: "Alarm fra",
    row: 1
  });
  lcd.clearScreen(0, 1, 15);

  // Clear the bottom part of screen after 3 seconds
  clearScreenTimeout = setTimeout(() => {
    lcd.clearScreen(1);
  }, 3000);
}

const rotaryEncoder$ = combineLatest(rE.value.pipe(debounceTime(150)), aS.value).pipe(
  filter(([rv, sv]) => rv !== lastRotaryValue),
  tap(([rv, sv]) => (lastRotaryValue = rv))
);
const alarmSwitch$ = aS.value.pipe(distinctUntilChanged());
const demoTime$ = alarmSwitch$.pipe(
  bufferTime(10000),
  filter(val => val.length >= 5)
);

rotaryEncoder$.subscribe(([rotaryValue, sv]) => {
  if (sv === 0) {
    updateAlarmTime(rotaryValue);
  }
  if (sv === 1) {
    updateVolume(rotaryValue);
  }
});

alarmSwitch$.subscribe(switchValue => {
  if (switchValue === 1) {
    alarmArmed = true;
    lightArmed = true;
    toggleAlarmOn();
  }
  if (switchValue === 0) {
    alarmArmed = false;
    lightArmed = false;
    toggleAlarmOff();
  }
});

demoTime$.subscribe(val => {
  clearTO();
  demoTime = true;

  lcd.print({
    message: "Hey Klara!",
    row: 1
  });

  clearScreenTimeout = setTimeout(() => {
    lcd.clearScreen(1, 10);
  }, 10000);
});

setInterval(() => {
  const time = format(utcToZonedTime(new Date(), timezone), "HH:mm:ss");
  const displayTime = time.substring(0, 5);

  // Show "HH:mm" with blinking separator every second
  const formatedDisplay = Number(time[time.length - 1]) % 2 === 0 ? displayTime : displayTime.replace(":", " ");
  lcd.print({
    message: formatedDisplay,
    row: 0
  });

  // Start the light sequence
  if (displayTime === lightAlarmTime && lightArmed) {
    hue.startWakeupSequence();
    lightArmed = false;
  }

  // Ring the ALARM!
  if (displayTime === alarmTime && alarmArmed) {
    aP.play();
    alarmArmed = false;
  }

  if (demoTime) {
    aP.play();
    hue.startWakeupSequence();
    demoTime = false;
  }
}, 1000);

// If ctrl+c is hit, free resources and exit.
process.on("SIGTERM", _ => {
  lcd.cleanup();
  rE.cleanup();
  aS.cleanup();
  process.exit();
});
