import { RotaryEncoder } from "./rotary-encoder";
import { AlarmSwitch } from "./alarm-switch";
import { cleanupLcd, printToLCD } from "./lcd";

console.log("Starting up!");

const rotaryEncoderPin1 = 4;
const rotaryEncoderPin2 = 8;
const alarmSwitchPin = 7;

const aS = new AlarmSwitch(alarmSwitchPin);
aS.value.subscribe(v => {
  console.log(`Alarm Switch is ${v ? "on" : "off"}`);
});

const rE = new RotaryEncoder(rotaryEncoderPin1, rotaryEncoderPin2);
rE.value.subscribe(v => {
  printToLCD({
    message: " ".repeat(16),
    row: 1
  });

  printToLCD({
    message: v.toString(),
    row: 1
  });
});

setInterval(() => {
  printToLCD({
    message: new Date().toISOString().substring(11, 19)
  });
}, 1000);

// If ctrl+c is hit, free resources and exit.
process.on("SIGTERM", _ => {
  cleanupLcd();
  rE.cleanup();
  process.exit();
});
