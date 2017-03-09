var mysql = require('mysql');

exports.init = function(now, cb) {
	console.info("[now.mysql] %s:%s/%s", now.ini.mysql.host, now.ini.mysql.port, now.ini.mysql.database);
    now.mysql = mysql.createPool(now.ini.mysql);
    now.mysql.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
        cb(err);
    });
};
