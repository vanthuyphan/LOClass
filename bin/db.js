var now;

var db = {};

exports.init = function(_now, cb) {
    now = _now;

    now.db = db;
    cb();
}

db.getUserByCode = function(code, cb) {
    now.mysql.query("SELECT * FROM `User` WHERE code=? LIMIT 1;", [code], function(err, rows) {
        if (rows) {
            cb(err, rows[0]);
        } else {
            cb(err);
        }
    });
};

db.getUserByEmail = function(email, cb) {
    now.mysql.query("SELECT * FROM `User` WHERE email=? LIMIT 1;", [email], function(err, rows) {
        if (rows) {
            cb(err, rows[0]);
        } else {
            cb(err);
        }
    });
};

db.getUsers = function(cb) {
    now.mysql.query("SELECT * FROM `User` WHERE isAdmin = 0", function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

db.getClasses = function(cb) {
    console.log("Get classes")
    now.mysql.query("SELECT * FROM `Class`", function(err, rows) {
        if (rows) {
            console.log(rows);
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

db.saveClass = function (model, cb) {
    console.log("Save class")
    now.mysql.query("INSERT INTO `Class` SET ?", {
        location: model.location,
        datetime: model.datetime,
        address: model.address,
        fee: model.fee,
        classSize: model.classSize
    }, function(err, result) {
        cb(err);
    });

}

db.removeClass = function (code, cb) {
    console.log("Code is" + code)
    now.mysql.query("DELETE FROM `Class` WHERE code = ?", [code], function(err, result) {
        cb(err);
    });
}
