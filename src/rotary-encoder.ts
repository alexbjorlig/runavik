import { BehaviorSubject } from "rxjs";
const Gpio = require("onoff").Gpio;

export class RotaryEncoder {
  private button1 = null;
  private button2 = null;
  private a: number = 0;
  private b: number = 0;
  private _value: number = 0;
  public value: BehaviorSubject<number> = new BehaviorSubject(this._value);

  constructor(pin1: number, pin2: number) {
    this.button1 = new Gpio(pin1, "in", "both");
    this.button2 = new Gpio(pin2, "in", "both");
    this.setup();
  }

  private setup(): void {
    //Watch for hardware interrupt of switch 1
    this.button1.watch((err, val) => {
      if (err) {
        throw err;
      }
      this.a = val;
      console.log(`RotaryA: ${val}`);
      this.update();
    });

    //Watch for hardware interrupt of switch 2
    this.button2.watch((err, val) => {
      if (err) {
        throw err;
      }
      this.b = val;
      console.log(`RotaryB: ${val}`);
      this.update();
    });
  }

  public update(): void {
    if (this.a == 1 && this.b == 1) {
      this._value++;
    } else if (this.a == 1 && this.b == 0) {
      this._value--;
    }

    if (this._value !== this.value.value) {
      console.log(`Rotary VALUE: ${this._value}`);
      this.value.next(this._value);
    }
  }

  public cleanup(): void {
    this.button1.unexport();
    this.button2.unexport();
  }
}
