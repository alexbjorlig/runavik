import { RotaryEncoder } from "./rotary-encoder";
import { cleanupLcd, printToLCD } from "./lcd";

const rE = new RotaryEncoder(23, 24);
rE.value.subscribe(v => {
  printToLCD({
    message: "".repeat(16),
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
