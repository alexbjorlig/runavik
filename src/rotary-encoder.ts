import { Observable } from "rxjs";
const Gpio = require("onoff").Gpio;

export function rotaryEncoder(pin1: number, pin2: number): Observable<number> {
  const observableToReturn: Observable<number> = Observable.create(function(
    observer
  ) {
    const button1 = new Gpio(pin1, "in", "both");
    const button2 = new Gpio(pin2, "in", "both");
    let a = 0;
    let b = 0;
    let v = 0;

    function exit() {
      button1.unexport();
      process.exit();
    }

    //Watch for hardware interrupt of switch 1
    button1.watch(function(err, value) {
      if (err) {
        throw err;
      }
      a = value;
    });

    //Watch for hardware interrupt of switch 2
    button2.watch(function(err, value) {
      if (err) {
        throw err;
      }
      b = value;

      //only evaluate if a = 1
      if (a == 1 && b == 1) {
        // observer.next(1);
        v++;
      } else if (a == 1 && b == 0) {
        // observer.next(-1);
        v--;
      }
      observer.next(v);
    });
  });
  return observableToReturn;
}
