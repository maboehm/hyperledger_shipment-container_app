/**
 * This class provides static methods for logging.
 * The class defines how to log messages.
 */
import { AppConfig } from "./app.config";
var Logger = (function () {
    function Logger() {
    }
    ////////////////////////////////////////////Properties////////////////////////////////////////////
    /////////////////////////////////////////////Methods///////////////////////////////////////////////
    Logger.log = function (msg) {
        if (AppConfig.DEVELOPMENT) {
            console.log(msg);
        }
    };
    Logger.error = function (msg) {
        console.error(msg);
    };
    Logger.warn = function (msg) {
        console.warn(msg);
    };
    Logger.debug = function (msg) {
        if (AppConfig.DEVELOPMENT) {
            console.debug(msg);
        }
    };
    return Logger;
}());
export { Logger };
//# sourceMappingURL=logger.js.map