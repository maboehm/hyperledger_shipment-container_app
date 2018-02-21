import { GlobalService } from './../../providers/global/global';
import { WatsonIotService } from './../../providers/watsonIot/watsonIot';
import { SensorService } from './../../providers/sensorService/sensorService';
import { BlockchainService } from './../../providers/blockchain/blockchain';
import { CameraService } from './../../providers/camera/camera';
import { Component } from "@angular/core";
import { IonicPage, Events } from "ionic-angular";
import { Logger } from "../../app/logger";
import { Insomnia } from "@ionic-native/insomnia";

import "../../app/typings";

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
  public acceleration: sensorData;
  public gyroscope: sensorData;
  public geolocation: geoData;
  public image: string;

  constructor(private insomnia: Insomnia, private events: Events, private global: GlobalService,
    private cameraService: CameraService, private blockchainService: BlockchainService,
    private sensorService: SensorService, private watsonIotService: WatsonIotService) {

    this.acceleration = { x: 0, y: 0, z: 0, timestamp: 0 };
    this.gyroscope = { x: 0, y: 0, z: 0, timestamp: 0 };
    this.geolocation = { lat: 0, lon: 0, timestamp: 0 };

    this.events.subscribe('sensordata', (data: sensorEvent) => {
      this.acceleration = data.acceleration;
      this.geolocation = data.geolocation;
      this.gyroscope = data.gyroscope;
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

    this.watsonIotService.start();
    this.sensorService.start();
    this.blockchainService.start();
  }

  /**
   * This method gets called once the page gets closed.
   * The method performs the following steps:
   * 1. stop keeping the device awake
   * 2. stop all services
   */
  // tslint:disable-next-line:no-unused-variable
  private ionViewWillLeave() {
    // allow the phone to sleep
    this.insomnia.allowSleepAgain().then(
      () => Logger.log('Allowed to sleep.'),
      (error) => Logger.error(error)
    );

    // end update interval
    this.watsonIotService.stop();
    this.sensorService.stop();
    this.blockchainService.stop();

    Logger.log("Ended Tracking!");
  }

  // Takes a Image and displays it
  public handleTakePictureCommand() {
    this.cameraService.handleCamera(this.global.deviceId).then((image: string) => {
      this.image = image;
    });
  }
}
