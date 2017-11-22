import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Logger} from "../../app/logger";
import IbmIot from "ibmiotf";
import {AppConfig} from "../../app/app.config";

/**
 * Generated class for the SensorsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sensors',
  templateUrl: 'sensors.html',
})
export class SensorsPage {

  private iotDevice: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // Build up device config object
    let config = {
      "org" : AppConfig.IBM_IOT_PLATFORM_ORGANIZATION,
      "id" : "paul-iPhone",
      "type" : AppConfig.IBM_IOT_PLATFORM_DEVICE_TYPE,
      "auth-method" : AppConfig.IBM_IOT_PLATFORM_AUTHENTICATION_MODE,
      "auth-token" : "testhlag"
    };

    // Create IoT device object
    this.iotDevice = new IbmIot.IotfDevice(config);

    // Configure log level for device
    if (AppConfig.DEVELOPMENT) {
      this.iotDevice.log.setLevel('debug');
    } else {
      this.iotDevice.log.setLevel('warn');
    }

    // Log all errors of the device to the console
    this.iotDevice.on("error", (error) => {
      Logger.error(error);
    });
  }

  ionViewDidLoad() {
    // connect device with IoT Platform
    Logger.log('Trys to connect to Watson IoT Platform!');
    this.iotDevice.connect();

    // wait until connected
    this.iotDevice.on('connect', function(){
      Logger.log("connected to IoT Platform");
    });

    Logger.log('Start Tracking!');
  }

  ionViewWillLeave() {
    // disconnect device from IoT platform
    Logger.log("End Tracking!!");
    this.iotDevice.disconnect();
  }

}
