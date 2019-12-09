import { RotaryEncoder } from "./rotary-encoder";
import { cleanupLcd, printToLCD } from "./lcd";

const RotaryEncoderPin1 = 4;
const RotaryEncoderPin2 = 8;

const rE = new RotaryEncoder(RotaryEncoderPin1, RotaryEncoderPin2);
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
