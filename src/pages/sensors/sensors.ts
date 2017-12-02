import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Logger} from "../../app/logger";
import IbmIot from "ibmiotf";
import {AppConfig} from "../../app/app.config";
import {DeviceMotion, DeviceMotionAccelerationData} from "@ionic-native/device-motion";
import {Gyroscope, GyroscopeOptions, GyroscopeOrientation} from "@ionic-native/gyroscope";
import {Geolocation, Geoposition} from "@ionic-native/geolocation";
import {
  CameraPreview, CameraPreviewOptions,
  CameraPreviewPictureOptions
} from "@ionic-native/camera-preview";

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
  private accelerationTime: number;

  private gyroscopeX: number;
  private gyroscopeY: number;
  private gyroscopeZ: number;
  private gyroscopeTime: number;

  private geolocationLatitude: number;
  private geolocationLongitude: number;
  private geolocationTime: number;

  private image: string;


  constructor(public navCtrl: NavController, public navParams: NavParams, private deviceMotion: DeviceMotion, private gyroscope: Gyroscope, private geolocation: Geolocation, private cameraPreview: CameraPreview) {
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
        this.sendStatusToIotPlatform(this.accelerationX, this.accelerationY, this.accelerationZ, this.accelerationTime, this.gyroscopeX, this.gyroscopeY, this.gyroscopeZ, this.gyroscopeTime, this.geolocationLatitude, this.geolocationLongitude, this.geolocationTime);
      }, 500);
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


  private sendStatusToIotPlatform(accelerationX: number, accelerationY: number, accelerationZ: number, accelerationTime: number, gyroscopeX: number, gyroscopeY: number, gyroscopeZ: number, gyroscopeTime: number, geolocationLatitude: number, geolocationLongitude: number, geolocationTime: number) {
    let deviceData = {
      acceleration: {
        x: accelerationX,
        y: accelerationY,
        z: accelerationZ,
        time: accelerationTime
      },
      gyroscope: {
        x: gyroscopeX,
        y: gyroscopeY,
        z: gyroscopeZ,
        time: gyroscopeTime
      },
      geolocation: {
        latitude: geolocationLatitude,
        longitude: geolocationLongitude,
        time: geolocationTime
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
        this.accelerationTime = acceleration.timestamp;

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
        this.gyroscopeTime = orientation.timestamp;

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
    this.geolocation.getCurrentPosition().then((geoposition: Geoposition) => {
      this.geolocationLatitude = geoposition.coords.latitude;
      this.geolocationLongitude = geoposition.coords.longitude;
      this.geolocationTime = geoposition.timestamp;

      Logger.log("Geolocation - /n" +
                 "geolocationLatitude: " + geoposition.coords.latitude +
                 "geolocationLongitude: " + geoposition.coords.longitude);
    }).catch((error: any) => {
      Logger.error(error);
    });
  }

  /**
   * This method uses the camera-preview plugin to automatically take a picture with the device camera.
   * https://github.com/cordova-plugin-camera-preview/
   */
  private updatePicture() {
    // options to configure the camera preview
    let cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: this.cameraPreview.CAMERA_DIRECTION.BACK,
      toBack: true,
      tapPhoto: false,
      previewDrag: false
    };

    //options to configure how the picture should be taken
    let pictureOpts: CameraPreviewPictureOptions = {
      width: 1280,
      height: 1280,
      quality: 85
    };

    // start the camera preview
    this.cameraPreview.startCamera(cameraPreviewOpts).then(response => {
      console.log("camera running!" + response);

      // wait just a little bit longer in order to give the camera enough time to start
      setTimeout(()=>{
        Logger.log("Try to take picture.");
        // turn the flash on
        this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.ON);

        // take the picture
        this.cameraPreview.takePicture(pictureOpts).then((base64PictureData) => {
          Logger.log("took picture successfully");
          // save the picture as base64 encoded string
          this.image = "data:image/jpeg;base64," + base64PictureData;
          // stop the camera preview
          this.cameraPreview.stopCamera();
        }, (error: any) => {
          Logger.error(error);
        });
      }, 5000);
    }).catch(error => {
      console.log("could not access camera: " + error);
    });
  }
}
