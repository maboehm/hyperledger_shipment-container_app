import { GlobalService } from './../global/global';
import { Events } from 'ionic-angular';
import { AppConfig } from './../../app/app.config';
import { HttpClient } from '@angular/common/http';
import { Logger } from './../../app/logger';
import { Injectable } from '@angular/core';
import "./../../app/typings";

@Injectable()

export class BlockchainService {
  private updateIntervalBlockchain: number;
  private exceptionFound: any;

  private deviceId: string;
  private shipmentId: string;

  acceleration: sensorData;
  gyroscope: sensorData;
  geolocation: geoData;

  constructor(private http: HttpClient, private events: Events, private global: GlobalService) {
    if (AppConfig.ENABLE_BLOCKCHAIN) {
      Logger.warn("Blockchain Tracking is disabled");
    }

    this.events.subscribe('sensordata', (data: sensorEvent) => {
      this.acceleration = data.acceleration;
      this.gyroscope = data.gyroscope;
      this.geolocation = data.geolocation;
      this.checkException(this.acceleration, this.gyroscope, this.geolocation);
    });
  }

  public start() {
    this.shipmentId = this.global.shipmentId;
    this.deviceId = this.global.deviceId;

    if (!AppConfig.ENABLE_BLOCKCHAIN) {
      return;
    }
    Logger.log("Setting up Blockchain!");

    this.updateIntervalBlockchain = setInterval(() => {
      if (this.exceptionFound) {
        Logger.log(["Exception occured", this.exceptionFound.time]);
        let data = {
          "$class": "org.kit.blockchain.ShipmentException",
          "message": this.exceptionFound.message,
          "gpsLat": this.geolocation.lat,
          "gpsLong": this.geolocation.lon,
          "shipment": "org.kit.blockchain.Shipment#" + this.shipmentId,
          "timestamp": new Date(this.exceptionFound.time).toISOString()
        }
        this.exceptionFound = null;
        this.http.post(AppConfig.URL_BLOCKCHAIN_EXCEPTION, data)
          .subscribe(data => {
            Logger.log(["Recieved data", data]);
          })
      }
    }, AppConfig.UPDATE_INTERVALL_BLOCKCHAIN);
  }

  public stop() {
    clearInterval(this.updateIntervalBlockchain);
  }

  /**
   * Checks for Exceptions, soley based on acceleration
   *
   * @param {sensorData} acceleration
   * @param {sensorData} gyroscope
   * @param {geoData} geolocation
   */
  private checkException(acceleration: sensorData, gyroscope: sensorData, geolocation: geoData) {

    let message: string;
    if (acceleration.z > 9) {
      // that is fine, correct orientation
    } else if (acceleration.z < -9) {
      message = "Container lies upside down.";
    } else if (acceleration.x > 9) {
      message = "Container lies left side down.";
    } else if (acceleration.x < -9) {
      message = "Container lies right side down.";
    } else if (acceleration.y > 9) {
      message = "Container is turned forward.";
    } else if (acceleration.y < -9) {
      message = "Container is turnend backwards.";
    }
    if (message && !this.exceptionFound) {
      let time = acceleration.timestamp ? acceleration.timestamp : new Date();
      let exception = { message: message, deviceId: this.deviceId, time: time };
      this.exceptionFound = exception;
    }
  }

}
