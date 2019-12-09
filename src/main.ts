import { rotaryEncoder } from "./rotary-encoder";
import { cleanupLcd, printToLCD } from "./lcd";
const Gpio = require("onoff").Gpio;

const button3 = new Gpio(7, "in", "both", { debounceTimeout: 10 });

console.log(button3.readSync());

button3.watch(function(err, value) {
  if (err) {
    throw err;
  }
  console.log(`Button3 ${value}`);
});

console.log("Starting up!");

rotaryEncoder(4, 8).subscribe(v => {
  printToLCD({ message: " ".repeat(16), row: 1 });
  printToLCD({ message: v.toString(), row: 1 });
});

setInterval(() => {
  printToLCD({
    message: new Date().toISOString().substring(11, 19)
  });
}, 1000);

// If ctrl+c is hit, free resources and exit.
process.on("SIGINT", _ => {
  cleanupLcd();
  process.exit();
});
