import * as fs from "fs";
import * as path from "path";
const savedAlarm = require("../alarm.json");

export class AlarmMemory {
  private filePath = path.join(__dirname, "..", "alarm.json");
  private storedTime: string;
  private storedVolume: number;

  constructor() {
    const { alarmTime, alarmVolume } = savedAlarm;
    this.storedTime = alarmTime;
    this.storedVolume = alarmVolume;
  }

  public saveTime(alarmTime: string): void {
    const alarmJson = { alarmTime, alarmVolume: this.storedVolume };
    this.storedTime = alarmTime;
    try {
      fs.writeFile(this.filePath, JSON.stringify(alarmJson), () => {
        console.log(`saved time: ${alarmTime}`);
      });
    } catch (e) {
      console.error(e);
    }
  }

  public saveVolume(alarmVolume: number): void {
    const alarmJson = { alarmVolume, alarmTime: this.storedTime };
    this.storedVolume = alarmVolume;
    try {
      fs.writeFile(this.filePath, JSON.stringify(alarmJson), () => {
        console.log(`saved volume: ${alarmVolume}`);
      });
    } catch (e) {
      console.error(e);
    }
  }

  public load(): { alarmTime: string; alarmVolume: number } {
    return {
      alarmTime: this.storedTime || null,
      alarmVolume: this.storedVolume || 0
    };
  }
}
