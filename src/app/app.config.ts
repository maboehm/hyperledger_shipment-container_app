/**
 * This class defines constants which can be used to configure the application.
 */
export class AppConfig {
  public static get DEVELOPMENT(): boolean {
    return false;
  };

  public static get ENABLE_WATSON_IOT(): boolean {
    return true;
  }

  public static get ENABLE_BLOCKCHAIN(): boolean {
    return true;
  }

  public static get UPDATE_INTERVALL_SENSORS(): number {
    return 400;
  }

  public static get UPDATE_INTERVALL_BLOCKCHAIN(): number {
    return 5000;
  }

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

  public static get URL_NODE_RED_SERVER(): string {
    return "https://kit-blockchain-dashboard.mybluemix.net/";
  }

  public static get URL_BLOCKCHAIN_EXCEPTION(): string {
    return "http://kit-blockchain.duckdns.org:31090/api/ShipmentException";
  }

}
