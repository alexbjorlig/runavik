const hueClient = require("huejay");
const hueConfig = require("../hue.json");

export class Hue {
  private hueAppName = "wake-up";
  private hueDeviceName = "wake-up-raspberry";
  private client: any;
  private bridgeUser: any;

  constructor() {
    this.discoverAndConnect();
  }

  async discoverHueBridge() {
    const discoveryResults = await hueClient.discover({ strategy: "upnp" });
    console.log(discoveryResults.length, discoveryResults);
    if (discoveryResults.length === 0) {
      console.error("Failed to discover bridge");
      return null;
    } else {
      return discoveryResults[0].ip;
    }
  }

  async isAuthenticated() {
    if (this.client) {
      try {
        return await this.client.bridge.isAuthenticated();
      } catch (error) {
        return false;
      }
    }
  }

  async startWakeupSequence() {
    try {
      let light = await this.client.lights.getById(1);
      light.on = true;
      light.brightness = 1;
      await this.client.lights.save(light);
      console.log("light 1 turned on!");
      setTimeout(() => {
        light.on = true;
        light.brightness = 127;
        light.transitionTime = 1800;
        this.client.lights.save(light);
        console.log("starting to increase brightness");
      }, 5000);
    } catch (error) {
      console.log("could not update light");
      console.log(error);
    }
  }

  async discoverAndConnect() {
    const ipAddress = await this.discoverHueBridge();
    this.client = new hueClient.Client({
      host: ipAddress,
      username: hueConfig.username ? hueConfig.username : null
    });
    if (this.isAuthenticated()) {
      this.client.users
        .get()
        .then(user => {
          console.log(user);
          this.bridgeUser = user;
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
}
