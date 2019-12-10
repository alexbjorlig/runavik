import * as Lcd from "lcd";

export interface LcdMessage {
  message: string;
  row?: number;
  column?: number;
}

export class LCD {
  private lcd = null;
  private ready = false;
  private cancelled = false;
  private printTasks: LcdMessage[] = [];

  constructor() {
    this.lcd = new Lcd({ rs: 14, e: 15, data: [5, 6, 13, 26], cols: 16, rows: 2 });
    this.processLCD();
  }

  private async processLCD(): Promise<void> {
    if (this.cancelled) {
      return;
    }

    if (!this.ready) {
      await this.setupLCD();
    }

    const messageToPrint = this.printTasks.shift();
    if (messageToPrint) {
      const { column = 0, row = 0, message } = messageToPrint;
      // First position cursor
      this.lcd.setCursor(column, row);
      // Next, print message
      await this._print(message);
    }

    //Process next LCD in 50ms
    setTimeout(() => this.processLCD(), 50);
  }

  private async setupLCD(): Promise<void> {
    return new Promise(resolve => {
      this.lcd.on("ready", () => {
        this.ready = true;
        resolve();
      });
    });
  }

  private async _print(value): Promise<void> {
    return new Promise((resolve, reject) => this.lcd.print(value, err => (!err ? resolve() : reject(err))));
  }

  public print(lcdMessage: LcdMessage): void {
    this.printTasks.push(lcdMessage);
  }

  public clearScreen(row: number = 0, chars: number = 16, column: number = 0): void {
    const clearScreenMessage = {
      message: " ".repeat(chars),
      row,
      column
    };
    this.printTasks.push(clearScreenMessage);
  }

  public cleanup(): void {
    this.cancelled = true;
    this.lcd.close();
  }
}
