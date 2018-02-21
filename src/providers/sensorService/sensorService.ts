import { AppConfig } from './../../app/app.config';
import { Logger } from './../../app/logger';
import { Injectable } from "@angular/core";
import { Events, Platform } from "ionic-angular";
import { DeviceMotion, DeviceMotionAccelerationData } from "@ionic-native/device-motion";
import { Gyroscope, GyroscopeOptions, GyroscopeOrientation } from "@ionic-native/gyroscope";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";

@Injectable()
export class SensorService {
  private acceleration: sensorData;
  private gyroscope: sensorData;
  private geolocation: geoData;
  private updateInterval: number;

  constructor(private events: Events, private platform: Platform,
    private deviceMotionService: DeviceMotion, private gyroscopeService: Gyroscope,
    private geolocationService: Geolocation) {

    this.acceleration = { x: 0, y: 0, z: 0, timestamp: 0 };
    this.gyroscope = { x: 0, y: 0, z: 0, timestamp: 0 };
    this.geolocation = { lat: 0, lon: 0, timestamp: 0 };
  }

  // starts collecting sensor data and publishing a event 'sensordata'
  public start() {
    this.updateInterval = setInterval(() => {
      Promise.all([
        this.updateAcceleratorData(),
        this.updateGeolocationData(),
        this.updateGyroscopeData()
      ]).then(() => {
        this.events.publish('sensordata', {
          acceleration: this.acceleration,
          gyroscope: this.gyroscope,
          geolocation: this.geolocation
        } as sensorEvent)
      })
    }, AppConfig.UPDATE_INTERVALL_SENSORS);
  }

  // stop collecting sensor data
  public stop() {
    clearInterval(this.updateInterval);
  }

  /**
 * This method is responsible for collecting the acceleration data of the device and storing it to the data field of this class.
 */
  private updateAcceleratorData() {
    if (!this.platform.is('cordova')) {
      return new Promise((resolve, reject) => {
        resolve({});
      });
    }
    let promise = this.deviceMotionService.getCurrentAcceleration();
    promise.then(
      (acceleration: DeviceMotionAccelerationData) => {
        this.acceleration.x = acceleration.x;
        this.acceleration.y = acceleration.y;
        this.acceleration.z = acceleration.z;
        this.acceleration.timestamp = acceleration.timestamp;
      }, (error: any) => Logger.error(error)
    );
    return promise;
  }

  /**
   * This method is responsible for collecting the gyroscope data of the device and storing it to the data field of this class.
   */
  private updateGyroscopeData() {
    if (!this.platform.is('cordova')) {
      return new Promise((resolve, reject) => {
        resolve({});
      });
    }
    let options: GyroscopeOptions = {
      frequency: 1000
    };

    let promise = this.gyroscopeService.getCurrent(options);
    promise.then(
      (orientation: GyroscopeOrientation) => {
        this.gyroscope.x = orientation.x;
        this.gyroscope.y = orientation.y;
        this.gyroscope.z = orientation.z;
        this.gyroscope.timestamp = orientation.timestamp;
      }
    ).catch((error: any) => {
      Logger.error(JSON.stringify(error));
    });

    return promise;
  }

  /**
   * This method is responsible for collecting the geolocation data of the device and storing it to the data field of this class.
   */
  private updateGeolocationData() {
    let promise = this.geolocationService.getCurrentPosition();
    promise.then((geoposition: Geoposition) => {
      this.geolocation.lat = geoposition.coords.latitude;
      this.geolocation.lon = geoposition.coords.longitude;
      this.geolocation.timestamp = geoposition.timestamp;

    }).catch((error: any) => {
      this.geolocation.lat = 50;
      this.geolocation.lon = 8;
      this.geolocation.timestamp = Date.now();
    });

    return promise;
  }
}
