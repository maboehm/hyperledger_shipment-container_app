import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {SensorsPage} from "../pages/sensors/sensors";
import {DeviceMotion} from "@ionic-native/device-motion";
import {Gyroscope} from "@ionic-native/gyroscope";
import {Geolocation} from "@ionic-native/geolocation";
import {CameraPreview} from "@ionic-native/camera-preview";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SensorsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SensorsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DeviceMotion,
    Gyroscope,
    Geolocation,
    CameraPreview,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
