import { HttpClient } from '@angular/common/http';
import { AppConfig } from './../../app/app.config';
import { Logger } from './../../app/logger';
import { Injectable } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from "@ionic-native/camera-preview";
/**
 * Global Service that handles variables, which are stored in the app storage
 * to be accessible accross sections
 * @export
 * @class GlobalService
 */
@Injectable()
export class CameraService {
  private image: string;

  constructor(private http: HttpClient, private cameraPreview: CameraPreview) {
    // nothing
  }

  /**
   * This method handles the "takePicture" command which can be triggered from within the dashboard.
   * First, a picture gets taken. Second, the picture gets uploaded to the dashboard directly (by passing the IoT platform).
   * The picture does not get send to the dashboard via the IoT platform since messagses send to the IoT platform are limited to less than 200kb.
   *
   * This method uses the camera-preview plugin to automatically take a picture with the device camera.
   * https://github.com/cordova-plugin-camera-preview/
   *
   * Caution: There is currently a bug in the cordova-plugin-camera-preview which causes this function to be really slow
   * on an iOS device!
   *
   * @param id: the id of the IoT Device
   */
  public handleCamera(id) {
    // ############# 1. Take the picture #############
    // options to configure the camera preview
    let cameraPreviewOpts: CameraPreviewOptions = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: this.cameraPreview.CAMERA_DIRECTION.BACK,
      toBack: true,
      tapPhoto: false,
      previewDrag: false
    };

    //options to configure how the picture should be taken
    let pictureOpts: CameraPreviewPictureOptions = {
      width: 600,
      height: 600,
      quality: 30
    };

    return new Promise((resolve, reject) => {


      // start the camera preview
      this.cameraPreview.startCamera(cameraPreviewOpts).then((response) => {
        console.log("camera running!" + response);

        // wait just a little bit longer in order to give the camera enough time to start
        // this is needed because of a bug in the "cordova-plugin-camera-preview" plugin
        setTimeout(() => {
          Logger.log("Try to take picture.");
          // turn the flash on
          this.cameraPreview.setFlashMode(this.cameraPreview.FLASH_MODE.ON);

          // take the picture
          this.cameraPreview.takePicture(pictureOpts).then((base64PictureData) => {
            Logger.log("took picture successfully");
            // save the picture as base64 encoded string
            this.image = "data:image/jpeg;base64," + base64PictureData;
            resolve(this.image);
            // stop the camera preview
            this.cameraPreview.stopCamera();

            // ############# 2. Upload the picture #############
            this.http.post(AppConfig.URL_NODE_RED_SERVER + "image-upload", { "deviceId": id, "image": this.image }).subscribe(
              // Successful responses call the first callback.
              (data) => { Logger.log("Image uploaded successfully.") },
              // Errors will call this callback instead:
              (err) => {
                Logger.error('Something went while uploading the image!' + JSON.stringify(err));
              }
            );
          }, (error: any) => {
            Logger.error(error);
          });
        }, 5000);
      }).catch(error => {
        console.log("could not access camera: " + error);
      });
    });
  }
}
