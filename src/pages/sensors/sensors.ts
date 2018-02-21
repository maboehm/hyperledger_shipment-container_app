import { CameraService } from './../../providers/camera/camera';
import { Component } from "@angular/core";
import { IonicPage, NavParams, Platform } from "ionic-angular";
import { Logger } from "../../app/logger";
import IbmIot from "ibmiotf";
import { AppConfig } from "../../app/app.config";
import { DeviceMotion, DeviceMotionAccelerationData } from "@ionic-native/device-motion";
import { Gyroscope, GyroscopeOptions, GyroscopeOrientation } from "@ionic-native/gyroscope";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";
import { HttpClient } from "@angular/common/http";
import { Insomnia } from "@ionic-native/insomnia";

interface sensorData {
  x: number,
  y: number,
  z: number,
  timestamp: number
}
interface geoData {
  lat: number,
  lon: number,
  timestamp: number
}

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
  private updateIntervalWatson: number;
  private updateIntervalBlockchain: number;
  private updateIntervalSensors: number;

  public acceleration: sensorData;
  public gyroscope: sensorData;
  public geolocation: geoData;
  public image: string;

  constructor(private navParams: NavParams, private http: HttpClient, private cameraService: CameraService,
    private deviceMotionService: DeviceMotion, private gyroscopeService: Gyroscope,
    private geolocationService: Geolocation,
    private insomnia: Insomnia, private platform: Platform) {

    this.setupIotDevice();
    this.acceleration = { x: 0, y: 0, z: 0, timestamp: 0 };
    this.gyroscope = { x: 0, y: 0, z: 0, timestamp: 0 };
    this.geolocation = { lat: 0, lon: 0, timestamp: 0 };
  }

  private setupIotDevice() {
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
  // tslint:disable-next-line:no-unused-variable
  private ionViewDidLoad() {
    // let the app stay awake
    this.insomnia.keepAwake().then(
      () => Logger.log('Stays awake.'),
      (error) => Logger.error(error)
    );

    this.setupSensors();
    this.setupWatsonIoT();
    this.setupBlockchain();
  }

  private setupSensors() {
    this.updateIntervalSensors = setInterval(() => {
      // update all the data
      this.updateAllData();
    }, 400);
  }

  private setupBlockchain() {
    Logger.log("Setting up Blockchain!");
    this.updateIntervalBlockchain = setInterval(() => {
      let exception = this.checkException(this.acceleration, this.gyroscope, this.geolocation)
      if (exception) {
        Logger.log(["Exception occured", exception]);
        let data = {
          "$class": "org.kit.blockchain.ShipmentException",
          "message": exception.message,
          "gpsLat": this.geolocation.lat,
          "gpsLong": this.geolocation.lon,
          "shipment": "org.kit.blockchain.Shipment#" + this.navParams.get('shipment'),
          "timestamp": new Date(exception.time).toISOString()
        }
        this.http.post("http://kit-blockchain.duckdns.org:31090/api/ShipmentException", data)
          .subscribe(data => {
            Logger.log(["Recieved data", data])
          })
      }
    }, 3000);
  }

  private setupWatsonIoT() {
    // connect device with IoT Platform
    Logger.log("Trys to connect to Watson IoT Platform!");
    this.iotDevice.connect();

    // wait until connected and start publishing data afterwards
    this.iotDevice.on("connect", () => {
      Logger.log("connected to IoT Platform");

      // update the device data in a specific interval
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
  // tslint:disable-next-line:no-unused-variable
  private ionViewWillLeave() {
    // allow the phone to sleep
    this.insomnia.allowSleepAgain().then(
      () => Logger.log('Allowed to sleep.'),
      (error) => Logger.error(error)
    );

    // end update interval
    clearInterval(this.updateIntervalWatson);
    clearInterval(this.updateIntervalBlockchain);
    clearInterval(this.updateIntervalSensors);
    Logger.log("Ended Tracking!");

    // disconnect device from IoT platform
    this.iotDevice.disconnect();
  }

  /**
   * Checks for Exceptions, soley based on acceleration
   *
   * @param {sensorData} acceleration
   * @param {sensorData} gyroscope
   * @param {geoData} geolocation
   */
  private checkException(
    acceleration: sensorData, gyroscope: sensorData, geolocation: geoData) {
    let status: any;
    let exception: any;
    let deviceId = this.navParams.get('id');
    if (acceleration.z > 9) {
      status = {
        payload: "Correct position",
        deviceId: deviceId
      };
    } else if (acceleration.z < -9) {
      status = {
        payload: "Upside down",
        deviceId: deviceId
      };
      exception = {
        message: "Container lies upside down.",
        deviceId: deviceId,
        time: acceleration.timestamp
      };
    } else if (acceleration.x > 9) {
      status = {
        payload: "Left side down",
        deviceId: deviceId
      };
      exception = {
        message: "Container lies left side down.",
        deviceId: deviceId,
        time: acceleration.timestamp
      };
    } else if (acceleration.x < -9) {
      status = {
        payload: "Right side down",
        deviceId: deviceId
      };
      exception = {
        message: "Container lies right side down.",
        deviceId: deviceId,
        time: acceleration.timestamp
      };
    } else if (acceleration.y > 9) {
      status = {
        payload: "Turned forward",
        deviceId: deviceId
      };
      exception = {
        message: "Container is turned forward.",
        deviceId: deviceId,
        time: acceleration.timestamp
      };
    } else if (acceleration.y < -9) {
      status = {
        payload: "Turnend backwards",
        deviceId: deviceId
      };
      exception = {
        message: "Container is turnend backwards.",
        deviceId: deviceId,
        time: acceleration.timestamp
      };
    } else {
      status = {
        payload: "No ground contact",
        deviceId: deviceId
      };
    }
    return exception;
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
    if (!this.platform.is('cordova')) {
      return;
    }
    this.deviceMotionService.getCurrentAcceleration().then(
      (acceleration: DeviceMotionAccelerationData) => {
        this.acceleration.x = acceleration.x;
        this.acceleration.y = acceleration.y;
        this.acceleration.z = acceleration.z;
        this.acceleration.timestamp = acceleration.timestamp;
      }, (error: any) => Logger.error(error)
    );
  }

  /**
   * This method is responsible for collecting the gyroscope data of the device and storing it to the data field of this class.
   */
  private updateGyroscopeData() {
    if (!this.platform.is('cordova')) {
      return;
    }
    let options: GyroscopeOptions = {
      frequency: 1000
    };

    this.gyroscopeService.getCurrent(options).then(
      (orientation: GyroscopeOrientation) => {
        this.gyroscope.x = orientation.x;
        this.gyroscope.y = orientation.y;
        this.gyroscope.z = orientation.z;
        this.gyroscope.timestamp = orientation.timestamp;
      }
    ).catch((error: any) => {
      Logger.error(JSON.stringify(error));
    });
  }

  /**
   * This method is responsible for collecting the geolocation data of the device and storing it to the data field of this class.
   */
  private updateGeolocationData() {
    this.geolocationService.getCurrentPosition().then((geoposition: Geoposition) => {
      this.geolocation.lat = geoposition.coords.latitude;
      this.geolocation.lon = geoposition.coords.longitude;
      this.geolocation.timestamp = geoposition.timestamp;

    }).catch((error: any) => {
      this.geolocation.lat = 50;
      this.geolocation.lon = 8;
      this.geolocation.timestamp = Date.now();
    });
  }


  private handelTakePictureCommand() {
    this.cameraService.handleCamera(this.navParams.get('id')).then((image: string) => {
      this.image = image;
    });
  }
}
