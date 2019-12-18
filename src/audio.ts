import { spawn, ChildProcess } from "child_process";
import * as path from "path";

export class AudioPlayer {
  private mixer: any;
  private processId: number;
  private audioProcess: ChildProcess;

  constructor(volume: number = 40) {
    this.setVolume(volume);
  }

  //Setting the volume via child process
  public setVolume(value: number): void {
    this.mixer = spawn("amixer", ["sset", "Master", `${value}%`]);
    this.mixer.stderr.on("data", err => {
      console.error(err);
    });
    this.mixer.on("close", () => {
      console.log(`volume changed to: ${value}%`);
    });
  }

  //Play the audio via child process
  public play(): void {
    if (!this.processId) {
      this.audioProcess = spawn("aplay", [path.join(__dirname, "../audio", this.pickAudio())], { stdio: "ignore" });
      this.processId = this.audioProcess.pid;
      console.log("playing audio with id:", this.processId);

      this.audioProcess.on("error", err => {
        throw err;
      });
      this.audioProcess.on("close", () => {
        console.log("audio is done!");
        this.processId = null;
      });
    }
  }

  public stop(): void {
    if (this.processId) {
      this.audioProcess.kill("SIGINT");
    }
  }

  private pickAudio(): string {
    return "waves.wav";
  }
}
