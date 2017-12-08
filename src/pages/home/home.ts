import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {SensorsPage} from "../sensors/sensors";
import {Logger} from "../../app/logger";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  private openSensorPage(organisation: string, deviceType: string, deviceId: string, authenticationToken: string) {
    // store the configuration data to the local app storage

    // call the sensor page to start the tracking
//    this.navCtrl.push(SensorsPage);
  }

}
