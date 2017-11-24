import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Logger} from "../../app/logger";
import IbmIot from "ibmiotf";
import {AppConfig} from "../../app/app.config";
import {DeviceMotion, DeviceMotionAccelerationData} from "@ionic-native/device-motion";
import {Gyroscope, GyroscopeOptions, GyroscopeOrientation} from "@ionic-native/gyroscope";
import {Geolocation, Geoposition} from "@ionic-native/geolocation";

/**
 * Generated class for the SensorsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-sensors",
  templateUrl: "sensors.html"
})
export class SensorsPage {

  private iotDevice: any;
  private updateInterval: any;

  // data
  private accelerationX: number;
  private accelerationY: number;
  private accelerationZ: number;

  private gyroscopeX: number;
  private gyroscopeY: number;
  private gyroscopeZ: number;

  private latitude: number;
  private longitude: number;

  constructor(public navCtrl: NavController, public navParams: NavParams, private deviceMotion: DeviceMotion, private gyroscope: Gyroscope, private geolocation: Geolocation) {
    // Build up device config object
    let config = {
      "org": AppConfig.IBM_IOT_PLATFORM_ORGANIZATION,
      "id": "iPhone-1",
      "type": AppConfig.IBM_IOT_PLATFORM_DEVICE_TYPE,
      "auth-method": AppConfig.IBM_IOT_PLATFORM_AUTHENTICATION_MODE,
      "auth-token": "iPhone-1"
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

  private ionViewDidLoad() {
    // connect device with IoT Platform
    Logger.log("Trys to connect to Watson IoT Platform!");
    this.iotDevice.connect();

    // wait until connected
    this.iotDevice.on("connect", () => {
      Logger.log("connected to IoT Platform");

      // update the device data in a specific interval
      this.updateInterval = setInterval(() => {
        // update all the data
        this.updateAllData();

        // send data to the IoT platform
        this.sendStatusToIotPlatform(this.accelerationX, this.accelerationY, this.accelerationZ, this.gyroscopeX, this.gyroscopeY, this.gyroscopeZ, this.latitude, this.longitude);
      }, 1000);
      Logger.log("Started Tracking!");
    });
  }

  private ionViewWillLeave() {
    // end update interval
    clearInterval(this.updateInterval);
    Logger.log("Ended Tracking!");

    // disconnect device from IoT platform
    this.iotDevice.disconnect();
  }


  private sendStatusToIotPlatform(accelerationX: number, accelerationY: number, accelerationZ: number, gyroscopeX: number, gyroscopeY: number, gyroscopeZ: number, latitude: number, longitude: number) {
    let deviceData = {
      acceleration: {
        x: accelerationX,
        y: accelerationY,
        z: accelerationZ
      },
      gyroscope: {
        x: gyroscopeX,
        y: gyroscopeY,
        z: gyroscopeZ
      },
      geolocation: {
        latitude: latitude,
        longitude: longitude
      }
    };

    Logger.debug(JSON.stringify(deviceData));


    this.iotDevice.publish("status", "json", JSON.stringify(deviceData), 0);
  }

  private updateAllData() {
    this.updateAcceleratorData();
    this.updateGyroscopeData();
    this.updateGeolocationData();
  }

  private updateAcceleratorData() {
    this.deviceMotion.getCurrentAcceleration().then(
      (acceleration: DeviceMotionAccelerationData) => {
        this.accelerationX = acceleration.x;
        this.accelerationY = acceleration.y;
        this.accelerationZ = acceleration.z;

        Logger.log("Acceleration - /n" +
                   "x: " + acceleration.x +
                   "y: " + acceleration.y +
                   "z: " + acceleration.z);
      }, (error: any) => Logger.error(error)
    );
  }

  private updateGyroscopeData() {
    let options: GyroscopeOptions = {
      frequency: 1000
    };

    this.gyroscope.getCurrent(options).then(
      (orientation: GyroscopeOrientation) => {
        this.gyroscopeX = orientation.x;
        this.gyroscopeY = orientation.y;
        this.gyroscopeZ = orientation.z;

        Logger.log("Orientation - /n" +
                   "x: " + orientation.x +
                   "y: " + orientation.y +
                   "z: " + orientation.z);
      }
    ).catch((error: any) => {
      Logger.error(JSON.stringify(error));
    });
  }

  private updateGeolocationData() {
    Logger.debug("HALLO");

    this.geolocation.getCurrentPosition().then((geoposition: Geoposition) => {
      this.latitude = geoposition.coords.latitude;
      this.longitude = geoposition.coords.longitude;

      Logger.log("Geolocation - /n" +
                 "latitude: " + geoposition.coords.latitude +
                 "longitude: " + geoposition.coords.longitude);
    }, (error: any) => {
      Logger.error(error);
    });
  }

}
