var log4js = require('log4js');
var fs = require("fs");

exports.init = function(now, cb) {
    now.logger = log4js;

    var appenders = [];
    var logInto = "";
    if (now.ini.logger.appenders.indexOf("console") >= 0) {
        appenders.push({
            type: 'console'
        });
        logInto += "    console";
    }
    if (now.ini.logger.appenders.indexOf("file") >= 0) {
        if (fs.statSync("logs").isDirectory()) {

        } else {
            fs.mkdirSync("logs");
        }
        var path = process.cwd() + "/logs/now.log"
        appenders.push({
            type: 'file',
            filename: path,
            maxLogSize: 20480,
            "absolute": true
        });
        logInto += "        " + path;
    }

    if (appenders.length === 0) {
        appenders.push({
            type: 'console'
        });
        logInto += "    console";
    }

    console.info("[logger]" + logInto);

    log4js.configure({
        appenders: appenders
    });
    log4js.replaceConsole();

    cb();
};
