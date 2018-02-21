import { GlobalService } from './../../providers/global/global';
import { Component } from '@angular/core';
import { NavController } from "ionic-angular";
import { SensorsPage } from "../sensors/sensors";

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
  public organisation: string;
  public deviceType: string;
  public deviceId: string;
  public authenticationToken: string;
  public shipmentId: string;

  constructor(
    private navCtrl: NavController, private global: GlobalService) {

    // load global variables
    this.global.ready().then(() => {
      this.authenticationToken = this.global.authenticationToken;
      this.deviceId = this.global.deviceId;
      this.deviceType = this.global.deviceType;
      this.organisation = this.global.organisation;
      this.shipmentId = this.global.shipmentId;
    })
  }

  /**
   * This method opens the sensor page and provides the sensor page with the login data of the
   * IoT device so that the device can be contacted to the IBM Watson IoT Platform.
   */
  // tslint:disable-next-line:no-unused-variable
  private openSensorPage() {
    // store the configuration data to the local app storage
    this.global.authenticationToken = this.authenticationToken;
    this.global.deviceId = this.deviceId;
    this.global.deviceType = this.deviceType;
    this.global.organisation = this.organisation;
    this.global.shipmentId = this.shipmentId;

    // call the sensor page to start the tracking
    this.navCtrl.push(SensorsPage);
  }

}
