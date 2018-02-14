/**
 * This class defines constants which can be used to configure the application.
 */
export class AppConfig {

////////////////////////////////////////////Properties////////////////////////////////////////////

  public static get DEVELOPMENT(): boolean {
    return true;
  };

  public static get STORAGE_KEY_ORGANISATION(): string {
    return "organisation";
  };
  public static get STORAGE_KEY_SHIPMENT_ID(): string {
    return "shipmentId";
  };
  public static get STORAGE_KEY_DEVICE_ID(): string {
    return "deviceId";
  };
  public static get STORAGE_KEY_DEVICE_TYPE(): string {
    return "deviceType";
  };
  public static get STORAGE_KEY_AUTHENTICATION_TOKEN(): string {
    return "authenticationToken";
  };

  public static get IBM_IOT_PLATFORM_AUTHENTICATION_MODE(): string {
    return "token";
  };

  public static get LOREM_IPSUM(): string {
    return "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
  };

  public static get URL_NODE_RED_SERVER(): string {
    return "https://container-tracker-dashboard.mybluemix.net/";
  }

}
