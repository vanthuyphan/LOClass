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
    now.mysql.query("INSERT INTO User(email, first_name, last_name, password, zip, phone, street) VALUES(?, ?, ?, ?, ?, ?, ?);", [
        model.email,
        model.first_name,
        model.last_name,
        model.password,
        model.zip || '',
        model.phone || '',
        model.street || ''
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

db.updateUser = function(userCode, model, cb) {
    now.mysql.query("UPDATE `User` SET email=?, first_name=?, last_name=?, " +
        "subscribe=?, phone=?, middle_name=?, street=?, zip=?, RENumber=?, LONumber=? WHERE code=?;", [
        model.email,
        model.first_name,
        model.last_name,
        model.subscribe,
        model.phone,
        model.middle_name,
        model.street,
        model.zip,
        model.RENumber,
        model.LONumber,
        userCode
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
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

db.getClass = function(code, cb) {
    now.mysql.query("SELECT * FROM `Class` WHERE code = ?", [code], function(err, rows) {
        if (rows) {
            console.log(rows[0])
            cb(err, rows[0]);
        } else {
            cb(err);
        }
    });
};

db.updateClass = function(model, cb) {
    now.mysql.query("UPDATE `Class` SET location = ?, datetime=?, fee=?, address=?, classSize=?, registed=? WHERE code = ?;",
        [model.editLocation, model.editDatetime, model.editFee, model.editAddress, model.editClassSize, model.editRegisted, model.editCode]
        , function(err, rows) {
        cb(err);
    });
};

db.getStudents = function(classCode, cb) {
    now.mysql.query("SELECT User.code, first_name, last_name, phone, email, note FROM `User` JOIN StudentClass ON StudentClass.userCode =  User.code WHERE StudentClass.`classCode` = ?;", [classCode], function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

db.getEmail = function(code, cb) {
    now.mysql.query("SELECT * FROM `EmailHistory` WHERE code = ?;", [code], function(err, rows) {
        if (rows) {
            var row = rows[0];
            if (row.content) {
                row.content = new Buffer(row.content, 'base64').toString('ascii');
            }
            cb(err, row);
        } else {
            cb(err);
        }
    });
};

db.saveNote = function(model, cb) {
    now.mysql.query("UPDATE `USER` SET note = ? WHERE code = ?;", [model.note, model.studentCode], function(err, rows) {
        cb(err);
    });
};


db.removeStudent = function(model, cb) {
    now.mysql.query("DELETE FROM `StudentClass` WHERE userCode = ? AND classCode =?", [model.studentCode, model.classCode], function(err, rows) {
        now.mysql.query("UPDATE `Class` SET registed = registed - 1 WHERE code = ?;", [model.classCode], function(err, result) {
            cb(err);
        });
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
    now.mysql.query("DELETE FROM `Class` WHERE code = ?", [code], function(err, result) {
        cb(err);
    });
}

db.registerClass = function (model, cb) {
    now.mysql.query("INSERT INTO StudentClass(userCode, classCode) VALUES(?, ?);", [
        model.userCode,
        model.classCode
    ], function(err, result) {
        if (result && result.insertId) {
            now.mysql.query("UPDATE `Class` SET registed = registed + 1 WHERE code = ?;", [model.classCode], function(err, result) {
                cb(err);
            });
        } else {
            cb();
        }
    });
}

db.unregisterClass = function (model, cb) {
    now.mysql.query("DELETE FROM StudentClass WHERE code=?;", [model.code], function(err, result) {
        now.mysql.query("UPDATE `Class` SET registed = registed - 1 WHERE code = ?", [model.classCode], function(err, result) {
            cb(err);
        });
    });
}

db.createEmailHistory = function(model, cb) {
    console.log(model);
    now.mysql.query("INSERT INTO EmailHistory(`from`, `to`, `subject`) VALUES(?, ?, ?, ?);", [model.from, model.to, model.subject, new Buffer(model.html).toString('base64')], function(err, result) {
        cb(err);
    });
};

db.getEmailHistories = function(cb) {
    now.mysql.query("SELECT * FROM `EmailHistory` ;", function(err, result) {
        cb(err, result);
    });
};
 

