import { Subject } from "rxjs";
import { filter, tap } from "rxjs/operators";
import * as Lcd from "lcd";

export interface LcdMessage {
  message: string;
  row?: number;
  column?: number;
}

const lcd = new Lcd({ rs: 14, e: 15, data: [5, 6, 13, 26], cols: 8, rows: 2 });
let cancelled = false;
let ready = false;

const printTasks: LcdMessage[] = [];

async function setupLCD() {
  return new Promise(resolve => {
    lcd.on("ready", () => {
      ready = true;
      resolve();
    });
  });
}

async function asyncPrint(value) {
  return new Promise((resolve, reject) => {
    lcd.print(value, err => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
  });
}

export function printToLCD(lcdMessage: LcdMessage) {
  printTasks.push(lcdMessage);
}

export function cleanupLcd() {
  cancelled = true;
  lcd.close();
}

async function processLCD() {
  if (cancelled === true) {
    return;
  }
  if (ready === false) {
    await setupLCD();
  }
  const messageToPrint = printTasks.shift();
  if (messageToPrint) {
    const { column = 0, row = 0, message } = messageToPrint;
    // First position cursor
    lcd.setCursor(column, row);
    // Next, print message
    await asyncPrint(message);
  }
  // Process next LCD in 50ms
  setTimeout(() => processLCD(), 50);
}

processLCD();
