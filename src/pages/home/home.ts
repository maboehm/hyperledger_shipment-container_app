import { Component } from '@angular/core';
import {NavController} from "ionic-angular";
import {SensorsPage} from "../sensors/sensors";
import {Logger} from "../../app/logger";
import {AppConfig} from "../../app/app.config";
import {Storage} from "@ionic/storage";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private organisation: string;
  private deviceType: string;
  private deviceId: string;
  private authenticationToken: string;

  constructor(public navCtrl: NavController, private storage: Storage) {
    // read configuration from the storage or set it to undefined
    this.storage.get(AppConfig.STORAGE_KEY_ORGANISATION).then((value:string) => {
      if (value != null) {
        this.organisation = value;
      } else {
        this.organisation = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_DEVICE_TYPE).then((value:string) => {
      if (value != null) {
        this.deviceType = value;
      } else {
        this.deviceType = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_DEVICE_ID).then((value:string) => {
      if (value != null) {
        this.deviceId = value;
      } else {
        this.deviceId = "";
      }
    });
    this.storage.get(AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN).then((value:string) => {
      if (value != null) {
        this.authenticationToken = value;
      } else {
        this.authenticationToken = "";
      }
    });
  }

  private openSensorPage() {
    // store the configuration data to the local app storage
    this.storage.set(AppConfig.STORAGE_KEY_ORGANISATION, this.organisation);
    this.storage.set(AppConfig.STORAGE_KEY_DEVICE_TYPE, this.deviceType);
    this.storage.set(AppConfig.STORAGE_KEY_DEVICE_ID, this.deviceId);
    this.storage.set(AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN, this.authenticationToken);


    // call the sensor page to start the tracking
    this.navCtrl.push(SensorsPage);
  }

}
