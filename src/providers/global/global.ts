import { AppConfig } from './../../app/app.config';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
/**
 * Global Service that handles variables, which are stored in the app storage
 * to be accessible accross sections
 * @export
 * @class GlobalService
 */
@Injectable()

export class GlobalService {
  private mapping = {};
  private promises = [];

  constructor(private storage: Storage) {
    this.mapping[AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN] = '_authenticationToken';
    this.mapping[AppConfig.STORAGE_KEY_DEVICE_ID] = '_deviceId';
    this.mapping[AppConfig.STORAGE_KEY_DEVICE_TYPE] = '_deviceType';
    this.mapping[AppConfig.STORAGE_KEY_ORGANISATION] = '_organisation';
    this.mapping[AppConfig.STORAGE_KEY_SHIPMENT_ID] = '_shipmentId';

    for (let key in this.mapping) {
      this.promises.push(this.storage.get(key))

      this.promises[this.promises.length - 1].then((value: string) => {
        this[this.mapping[key]] = value ? value : "";
      });
    }
  }

  public ready() {
    return Promise.all(this.promises);
  }

  private getAny(key: string): string {
    return this[this.mapping[key]];
  }

  private setAny(key: string, newValue: string) {
    this.storage.set(key, newValue);
    this[this.mapping[key]] = newValue;
  }

  get authenticationToken(): string {
    return this.getAny(AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN);
  }
  set authenticationToken(newValue: string) {
    this.setAny(AppConfig.STORAGE_KEY_AUTHENTICATION_TOKEN, newValue);
  }

  get deviceId(): string {
    return this.getAny(AppConfig.STORAGE_KEY_DEVICE_ID);
  }
  set deviceId(newValue: string) {
    this.setAny(AppConfig.STORAGE_KEY_DEVICE_ID, newValue);
  }

  get deviceType(): string {
    return this.getAny(AppConfig.STORAGE_KEY_DEVICE_TYPE);
  }
  set deviceType(newValue: string) {
    this.setAny(AppConfig.STORAGE_KEY_DEVICE_TYPE, newValue);
  }

  get organisation(): string {
    return this.getAny(AppConfig.STORAGE_KEY_ORGANISATION);
  }
  set organisation(newValue: string) {
    this.setAny(AppConfig.STORAGE_KEY_ORGANISATION, newValue);
  }

  get shipmentId(): string {
    return this.getAny(AppConfig.STORAGE_KEY_SHIPMENT_ID);
  }
  set shipmentId(newValue: string) {
    this.setAny(AppConfig.STORAGE_KEY_SHIPMENT_ID, newValue);
  }
}
