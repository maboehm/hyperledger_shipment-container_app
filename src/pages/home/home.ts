import { Component } from '@angular/core';
import { NavController } from "ionic-angular";
import { SensorsPage } from "../sensors/sensors";
import { AppConfig } from "../../app/app.config";
import { Storage } from "@ionic/storage";

/**
 * This class represents the start screen of the app.
 * Via this app page the IoT device can be configured with the correct credentials in order to connect it to the
 * IBM Watson IoT Platform. This class does also make sure that the configuration gets saved persistently to the app storage.
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private organisation: string;
  private deviceType: string;
  private deviceId: string;
  private authenticationToken: string;
  private shipmentId: string;

  constructor(
    private navCtrl: NavController,
    private storage: Storage) {
    // read configuration from the storage or set it to undefined
    this.storage.get(AppConfig.STORAGE_KEY_ORGANISATION).then((value: string) => {
      if (value != null) {
        this.organisation = value;
      } else {
        this.organisation = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_SHIPMENT_ID).then((value: string) => {
      if (value != null) {
        this.shipmentId = value;
      } else {
        this.shipmentId = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_DEVICE_TYPE).then((value: string) => {
      if (value != null) {
        this.deviceType = value;
      } else {
        this.deviceType = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_DEVICE_ID).then((value: string) => {
      if (value != null) {
        this.deviceId = value;
      } else {
        this.deviceId = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN).then((value: string) => {
      if (value != null) {
        this.authenticationToken = value;
      } else {
        this.authenticationToken = "";
      }
    });
  }

  /**
   * This method opens the sensor page and provides the sensor page with the login data of the
   * IoT device so that the device can be contacted to the IBM Watson IoT Platform.
   */
  // tslint:disable-next-line:no-unused-variable
  private openSensorPage() {
    // store the configuration data to the local app storage
    this.storage.set(AppConfig.STORAGE_KEY_ORGANISATION, this.organisation);
    this.storage.set(AppConfig.STORAGE_KEY_SHIPMENT_ID, this.shipmentId);
    this.storage.set(AppConfig.STORAGE_KEY_DEVICE_TYPE, this.deviceType);
    this.storage.set(AppConfig.STORAGE_KEY_DEVICE_ID, this.deviceId);
    this.storage.set(AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN, this.authenticationToken);


    // build up payload to pass to the sensor page
    let payload: any = {
      "org": this.organisation,
      "id": this.deviceId,
      "type": this.deviceType,
      "auth-token": this.authenticationToken,
      "shipment": this.shipmentId
    };
    // call the sensor page to start the tracking
    this.navCtrl.push(SensorsPage, payload);
  }

}
