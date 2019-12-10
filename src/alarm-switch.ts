import { BehaviorSubject } from "rxjs";
const Gpio = require("onoff").Gpio;

export class AlarmSwitch {
  private switch = null;
  public value: BehaviorSubject<number> = new BehaviorSubject(null);

  constructor(pin: number) {
    this.switch = new Gpio(pin, "in", "both", { debounceTimeout: 10 });
    this.setup();
  }

  private setup(): void {
    this.value.next(this.switch.readSync());
    this.switch.watch((err, val) => {
      if (err) {
        throw err;
      }
      this.value.next(val);
    });
  }

  public cleanup(): void {
    this.switch.unexport();
  }
}
