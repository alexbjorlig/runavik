import { BehaviorSubject } from "rxjs";
const Gpio = require("onoff").Gpio;

export class AlarmSwitch {
  private switch = null;
  private _value = 0;
  public value = new BehaviorSubject(this._value);

  constructor(pin: number) {
    this.switch = new Gpio(pin, "in", "both", { debounceTimeout: 10 });
    this._value = this.switch.readSync();
    this.setup();
  }

  private setup(): void {
    this.switch.watch((err, val) => {
      if (err) {
        throw err;
      }
      this._value = val;
      this.value.next(this._value);
    });
  }

  public cleanup(): void {
    this.switch.unexport();
  }
}
