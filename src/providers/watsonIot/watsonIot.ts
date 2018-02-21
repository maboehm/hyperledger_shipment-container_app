import { Events } from 'ionic-angular';
import { CameraService } from './../camera/camera';
import { Logger } from './../../app/logger';
import { AppConfig } from './../../app/app.config';
import { GlobalService } from './../global/global';
import { Injectable } from '@angular/core';
import IbmIot from "ibmiotf";
import "./../../app/typings";

@Injectable()
export class WatsonIotService {
  private iotDevice: any;
  private updateIntervalWatson: number;

  private acceleration: sensorData;
  private gyroscope: sensorData;
  private geolocation: geoData;

  constructor(private global: GlobalService, private cameraService: CameraService, private events: Events) {
    if (!AppConfig.ENABLE_WATSON_IOT) {
      Logger.warn("Watson IoT Tracking is disabled");
      return;
    }
    this.events.subscribe('sensordata', (data: sensorEvent) => {
      this.acceleration = data.acceleration;
      this.gyroscope = data.gyroscope;
      this.geolocation = data.geolocation;
    });

    this.setupDevice();
  }

  // start sending the sensor data to the WatsonIoT Platform
  public start() {
    if (!AppConfig.ENABLE_WATSON_IOT) {
      return;
    }
    // connect device with IoT Platform
    Logger.log("Trys to connect to Watson IoT Platform!");
    this.iotDevice.connect();

    // wait until connected and start publishing data afterwards
    this.iotDevice.on("connect", () => {
      Logger.log("connected to IoT Platform");

      // update the device data in a specific interval
      if (this.updateIntervalWatson) return;
      this.updateIntervalWatson = setInterval(() => {
        // send data to the IoT platform
        this.sendStatusToIotPlatform(this.acceleration, this.gyroscope, this.geolocation);
      }, 500);
      Logger.log("Started Tracking!");
    });

    // listen to commands send to this device for execution
    this.iotDevice.on("command", (commandName, format, payload, topic) => {
      // if the command is "takePicture"
      if (commandName === "takePicture") {
        this.cameraService.handleCamera(this.global.deviceId).then((image: string) => {
          Logger.log("took image");
        });

        // if the command is unknown then throw an exception
      } else {
        Logger.error("Command not supported: " + commandName);
      }
    });
  }

  // stop sending the data and disconnect the device
  public stop() {
    clearInterval(this.updateIntervalWatson);
    this.updateIntervalWatson = null;
    this.iotDevice.disconnect();
  }

  // configures the Watson IoT-Device
  private setupDevice() {
    // Build up device config object - therefore, load the config data
    let config = {
      "org": this.global.organisation,
      "id": this.global.deviceId,
      "type": this.global.deviceType,
      "auth-method": AppConfig.IBM_IOT_PLATFORM_AUTHENTICATION_MODE,
      "auth-token": this.global.authenticationToken
    };

    // Create IoT device object
    this.iotDevice = new IbmIot.IotfDevice(config);

    // Configure log level for device
    if (AppConfig.DEVELOPMENT) {
      this.iotDevice.log.setLevel("debug");
    } else {
      this.iotDevice.log.setLevel("warn");
    }

    // Log all errors of the device to the console
    this.iotDevice.on("error", (error) => {
      Logger.error(error.msg);
    });
  }

  /**
   * This method is responsible for sending the data of the device to the IBM Watson IoT Platform.
   * Therefor, the method stores all the data in one JSON object.
   *
   * @param {sensorData} acceleration
   * @param {sensorData} gyroscope
   * @param {geoData} geolocation
   */
  private sendStatusToIotPlatform(acceleration: sensorData, gyroscope: sensorData, geolocation: geoData) {
    let deviceData = {
      acceleration: {
        x: acceleration.x,
        y: acceleration.y,
        z: acceleration.z,
        time: acceleration.timestamp
      },
      gyroscope: {
        x: gyroscope.x,
        y: gyroscope.y,
        z: gyroscope.z,
        time: gyroscope.timestamp
      },
      geolocation: {
        latitude: geolocation.lat,
        longitude: geolocation.lon,
        time: geolocation.timestamp
      }
    };

    this.iotDevice.publish("status", "json", JSON.stringify(deviceData), 0);
  }
}
