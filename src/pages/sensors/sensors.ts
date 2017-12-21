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
import {Storage} from "@ionic/storage";
import {HttpClient} from "@angular/common/http";
import {Insomnia} from "@ionic-native/insomnia";

/**
 * This class represents the sensor page which collects the sensor data form the device and sends it to the IBM Watson IoT Platform.
 * Therefore, this class first connects the device as an IoT device to the IBM Watson IoT Platform using the credentials provided via {@NavParams}.
 *
 * As soon as the class was able to build up a connection to the IBM Watson IoT Platform, the class collects the wanted data from the device sensors and listens to commands send via the IBM Watson IoT Platform to the device.
 *
 * In order to make sure that the device will not fall a sleep while collecting data {@Insomnia} gets used to keep the device awake while this sensor page is open.
 */

@IonicPage()
@Component({
  selector: "page-sensors",
  templateUrl: "sensors.html"
})
export class SensorsPage {

  private iotDevice: any;
  private updateInterval: any;

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


  constructor(public navCtrl: NavController, public navParams: NavParams, private http: HttpClient, private deviceMotion: DeviceMotion, private gyroscope: Gyroscope, private geolocation: Geolocation, private cameraPreview: CameraPreview, private storage: Storage, private insomnia: Insomnia) {
    // Build up device config object - therefore, load the config data
    let config = {
      "org": this.navParams.get('org'),
      "id": this.navParams.get('id'),
      "type": this.navParams.get('type'),
      "auth-method": AppConfig.IBM_IOT_PLATFORM_AUTHENTICATION_MODE,
      "auth-token": this.navParams.get('auth-token')
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
   * This method gets called as soon as the page got loaded.
   * The method performs the following steps:
   * 1. Keep device awake
   * 2. Connect device as IoT device to the IBM Watson IoT Platform
   * 3. Once connected it collects the wanted sensor data in a specific interval and sends it to the IBM Watson IoT Platform
   * 4. The method subscribes the device to incoming commands from the IBM Watson IoT Platform.
   */
  private ionViewDidLoad() {
    // let the app stay awake
    this.insomnia.keepAwake().then(
        () => Logger.log('Stays awake.'),
        (error) => Logger.error(error)
    );

    // connect device with IoT Platform
    Logger.log("Trys to connect to Watson IoT Platform!");
    this.iotDevice.connect();

    // wait until connected and start publishing data afterwards
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

    // listen to commands send to this device for execution
    this.iotDevice.on("command", (commandName,format,payload,topic) => {
      // if the command is "takePicture"
      if(commandName === "takePicture") {
        this.handelTakePictureCommand();

      // if the command is unknown then throw an exception
      } else {
        Logger.error("Command not supported: " + commandName);
      }
    });
  }

  /**
   * This method gets called once the page gets closed.
   * The method performs the following steps:
   * 1. stop keeping the device awake
   * 2. cancel the sensor data collecting interval
   * 3. disconnect the device from the IBM Watson IoT Platform
   */
  private ionViewWillLeave() {
    // allow the phone to sleep
    this.insomnia.allowSleepAgain().then(
      () => Logger.log('Allowed to sleep.'),
      (error) => Logger.error(error)
    );

    // end update interval
    clearInterval(this.updateInterval);
    Logger.log("Ended Tracking!");

    // disconnect device from IoT platform
    this.iotDevice.disconnect();
  }


  /**
   * This method is responsible for sending the data of the device to the IBM Watson IoT Platform.
   * Therefor, the method stores all the data in one JSON object.
   *
   * @param {number} accelerationX
   * @param {number} accelerationY
   * @param {number} accelerationZ
   * @param {number} accelerationTime
   * @param {number} gyroscopeX
   * @param {number} gyroscopeY
   * @param {number} gyroscopeZ
   * @param {number} gyroscopeTime
   * @param {number} geolocationLatitude
   * @param {number} geolocationLongitude
   * @param {number} geolocationTime
   */
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

    this.iotDevice.publish("status", "json", JSON.stringify(deviceData), 0);
  }

  /**
   * This method calls all the different functions responsible for reading the data from sensors.
   */
  private updateAllData() {
    this.updateAcceleratorData();
    this.updateGyroscopeData();
    this.updateGeolocationData();
  }

  /**
   * This method is responsible for collecting the acceleration data of the device and storing it to the data field of this class.
   */
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

  /**
   * This method is responsible for collecting the gyroscope data of the device and storing it to the data field of this class.
   */
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

  /**
   * This method is responsible for collecting the geolocation data of the device and storing it to the data field of this class.
   */
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
   * This method handles the "takePicture" command which can be triggered from within the dashboard.
   * First, a picture gets taken. Second, the picture gets uploaded to the dashboard directly (by passing the IoT platform).
   * The picture does not get send to the dashboard via the IoT platform since messagses send to the IoT platform are limited to less than 200kb.
   *
   * This method uses the camera-preview plugin to automatically take a picture with the device camera.
   * https://github.com/cordova-plugin-camera-preview/
   *
   * Caution: There is currently a bug in the cordova-plugin-camera-preview which causes this function to be really slow
   * on an iOS device!
   */
  private handelTakePictureCommand() {
    // ############# 1. Take the picture #############
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
      width: 600,
      height: 600,
      quality: 30
    };

    // start the camera preview
    this.cameraPreview.startCamera(cameraPreviewOpts).then((response) => {
      console.log("camera running!" + response);

      // wait just a little bit longer in order to give the camera enough time to start
      // this is needed because of a bug in the "cordova-plugin-camera-preview" plugin
      setTimeout(() => {
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

          // ############# 2. Upload the picture #############
          this.http.post(AppConfig.URL_NODE_RED_SERVER + "image-upload", {"deviceId": this.navParams.get('id'), "image": this.image}).subscribe(
            // Successful responses call the first callback.
            (data) => {Logger.log("Image uploaded successfully.")},
            // Errors will call this callback instead:
            (err) => {
              Logger.error('Something went while uploading the image!' + JSON.stringify(err));
            }
          );
        }, (error: any) => {
          Logger.error(error);
        });
      }, 5000);
    }).catch(error => {
      console.log("could not access camera: " + error);
    });
  }

}
