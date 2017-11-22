/**
 * This class defines constants which can be used to configure the application.
 */
var AppConfig = (function () {
    function AppConfig() {
    }
    Object.defineProperty(AppConfig, "DEVELOPMENT", {
        ////////////////////////////////////////////Properties////////////////////////////////////////////
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(AppConfig, "LOREM_IPSUM", {
        get: function () {
            return "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
        },
        enumerable: true,
        configurable: true
    });
    ;
    return AppConfig;
}());
export { AppConfig };
//# sourceMappingURL=app.config.js.map