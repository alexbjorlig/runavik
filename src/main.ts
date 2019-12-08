import { rotaryEncoder } from "./rotary-encoder";
import { cleanupLcd, printToLCD } from "./lcd";

rotaryEncoder(23, 24).subscribe(v => {
  printToLCD({ message: "".repeat(16), row: 1 });
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
