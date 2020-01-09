import { BehaviorSubject } from "rxjs";
import { AlarmSwitch } from "./alarm-switch";
import { distinctUntilChanged } from "rxjs/operators";
const Gpio = require("onoff").Gpio;

const clampNumber = (num: number, a: number, b: number) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

export class RotaryEncoder {
  private aPin = null;
  private bPin = null;
  private lastEncoded = 0;
  private _value: number = 0;
  private timeValue: number = 0;
  private timeEncoded: number = 0;
  private volumeValue: number = 0;
  private volumeEncoded: number = 0;
  private sValue: number = 0;
  public value: BehaviorSubject<number> = new BehaviorSubject(this._value);

  constructor(pin1: number, pin2: number, alarmSwitch: AlarmSwitch) {
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleInterrupt = this.handleInterrupt.bind(this);

    this.aPin = new Gpio(pin1, "in", "both");
    this.bPin = new Gpio(pin2, "in", "both");

    this.aPin.watch((err, val) => this.handleInterrupt());
    this.bPin.watch((err, val) => this.handleInterrupt());
    alarmSwitch.value.pipe(distinctUntilChanged()).subscribe(value => this.switchValue(value));
  }

  private handleInterrupt(): void {
    this.handleUpdate(this.aPin.readSync(), this.bPin.readSync());
  }

  private handleUpdate(aVal: number, bVal: number): void {
    const lastValue = this.value.value;
    // Magic shit with bitshifting
    const encoded = (aVal << 1) | bVal;
    const sum = (this.lastEncoded << 2) | encoded;

    if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
      this._value++;
    }
    if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
      this._value--;
    }

    this.lastEncoded = encoded;

    if (this.sValue === 1) {
      // Limit volume value to a number between 0% and 100%
      // this._value = clampNumber(this._value, -8, 12);
      // 10% - 80%
      this._value = clampNumber(this._value, -12, 2);
    }

    if (lastValue !== this._value) {
      this.value.next(this._value);
    }
  }

  private switchValue(switchValue: number) {
    this.sValue = switchValue;
    // Changing to volume value
    if (switchValue === 1) {
      this.timeValue = this.value.value;
      this.timeEncoded = this.lastEncoded;
      this._value = this.volumeValue;
      this.lastEncoded = this.volumeEncoded;
    }
    // Changing to alarm value
    if (switchValue === 0) {
      this.volumeValue = this.value.value;
      this.volumeEncoded = this.lastEncoded;
      this._value = this.timeValue;
      this.lastEncoded = this.timeEncoded;
    }
  }

  public cleanup(): void {
    this.aPin.unexport();
    this.bPin.unexport();
  }
}
