/**
 * This class defines constants which can be used to configure the application.
 */
export class AppConfig {

////////////////////////////////////////////Properties////////////////////////////////////////////

  public static get DEVELOPMENT(): boolean {
    return true;
  };

  public static get IBM_IOT_PLATFORM_DEVICE_TYPE(): string {
    return "Smartphone";
  };

  /** Represents the personal IoT Platform */
  public static get IBM_IOT_PLATFORM_ORGANIZATION(): string {
    return "gn52u4";
  };

  public static get IBM_IOT_PLATFORM_AUTHENTICATION_MODE(): string {
    return "token";
  };

  public static get LOREM_IPSUM(): string {
    return "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
  };

}
