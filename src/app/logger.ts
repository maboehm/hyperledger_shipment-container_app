/**
 * This class provides static methods for logging.
 * The class defines how to log messages.
 */

import { AppConfig } from "./app.config";

export class Logger {
  public static log(...msg: any[]) {
    if (AppConfig.DEVELOPMENT) {
      console.log(...msg);
    }
  }

  public static error(...msg: any[]) {
    console.error(...msg);
  }

  public static warn(...msg: any[]) {
    console.warn(...msg);
  }

  public static debug(...msg: any[]) {
    if (AppConfig.DEVELOPMENT) {
      console.debug(...msg);
    }
  }
}
