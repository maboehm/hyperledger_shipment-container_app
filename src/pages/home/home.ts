import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {SensorsPage} from "../sensors/sensors";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

  private openSensorPage() {
    this.navCtrl.push(SensorsPage);
  }

}
