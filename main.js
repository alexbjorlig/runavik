const Lcd = require("lcd");
const lcd = new Lcd({ rs: 14, e: 15, data: [5, 6, 13, 26], cols: 8, rows: 2 });
const { Subject } = require('rxjs');

const printSubject = new Subject();
printSubject.pipe(
    
)
.subscribe();

function setupLCD() {
  return new Promise(resolve => {
    lcd.on("ready", () => resolve());
  });
}

async function asyncPrint(value) {
    return new Promise((resolve, reject) => {
        lcd.print(value, (err) => {
            if (!err) {
                resolve();
            } else {
                reject(err);
            }
        })
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function mainFunction() {
  try {
    console.log("main function running");
    await setupLCD();
    console.log("Starting up!");
    lcd.setCursor(0, 0);
    await asyncPrint(new Date().toISOString().substring(11, 19));
    await sleep(3000);
    lcd.setCursor(0, 1);
    await asyncPrint('Jonas & AC');
    await sleep(3000);
    lcd.setCursor(0, 1)
    await asyncPrint('Vi er igang :)')
  } catch (error) {
    console.log(error);
  }
}

// lcd.on('ready', () => {
//   setInterval(_ => {
//     lcd.setCursor(0, 0);
//     lcd.print(new Date().toISOString().substring(11, 19), err => {
//       if (err) {
//         throw err;
//       }
//     });
//   }, 1000);
// });

mainFunction();

// If ctrl+c is hit, free resources and exit.
process.on("SIGINT", _ => {
  lcd.close();
  process.exit();
});
