var now;

var db = {};

exports.init = function(_now, cb) {
    now = _now;

    now.db = db;
    cb();
}

/**
 * User
 */
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

db.changePassword = function(email, password, cb) {
    now.mysql.query("UPDATE `User` SET password=? WHERE email=?;", [password, email], function(err) {
        cb(err);
    });
};

db.verifyUser = function(code, cb) {
    now.mysql.query("UPDATE `User` SET verified=true WHERE code=?;", [code], function(err) {
        cb(err);
    });
};

db.insertUser = function(model, cb) {
    console.log("INSERTING")
    now.mysql.query("INSERT INTO User(email, first_name, last_name, subscribe, phone, password) VALUES(?, ?, ?, ?, ?, ?);", [
        model.email,
        model.first_name,
        model.last_name,
        model.subscribe,
        model.phone,
        model.password,
    ], function(err, result) {
        if (err) {
            console.log(err)
        }
        if (result) {
            model.code = result.insertId;
        }
        cb(err, model);
    });
};

db.getUsers = function(cb) {
    now.mysql.query("SELECT * FROM `User`;", function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

/**
 * Oauth
 */

db.insertOauth = function(model, cb) {
    now.mysql.query("INSERT INTO Oauth SET ?", {
        userCode: model.userCode,
        profileId: model.profileId,
        provider: model.provider
    }, function(err, result) {
        cb(err);
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
    now.mysql.query("SELECT * FROM `Class`", function(err, rows) {
        console.log("Getting classses")
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

db.getStudents = function(classCode, cb) {
    console.log("Getting Student")
    now.mysql.query("SELECT User.code, first_name, last_name, phone, email, note FROM `User` JOIN StudentClass ON StudentClass.userCode =  User.code WHERE StudentClass.`classCode` = ?;", [classCode], function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};


db.removeStudent = function(model, cb) {
    now.mysql.query("DELETE FROM `StudentClass` WHERE userCode = ? AND classCode =?", [model.studentCode, model.classCode], function(err, rows) {
        cb(err);
    });
};

db.getClassesWithUser = function (userCode, cb) {
    now.mysql.query("SELECT location, Class.code, address, fee, classSize, registed, datetime, classCode, userCode, StudentClass.code AS studentClassCode FROM Class LEFT JOIN StudentClass ON StudentClass.userCode=? AND Class.code = StudentClass.classCode;", [userCode], function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
}

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

db.registerClass = function (model, cb) {
    now.mysql.query("INSERT INTO StudentClass(userCode, classCode) VALUES(?, ?);", [
        model.userCode,
        model.classCode
    ], function(err, result) {
        console.log(result);
        cb(err);
    });
}

db.unregisterClass = function (model, cb) {
    now.mysql.query("DELETE FROM StudentClass WHERE code=?;", [model.code], function(err, result) {
        console.log("Dleeting" + result);
        cb(err);
    });
}

db.runRegisterClass = function (code) {
    now.mysql.query("DELETE FROM `StudentClass` WHERE code ?", [code], function(err, result) {
        cb(err);
    });
}
