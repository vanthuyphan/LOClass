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

db.getCourses = function(cb) {
    now.mysql.query("SELECT * FROM `Course`", function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};


db.getClasses = function(courseCode, cb) {
    now.mysql.query("SELECT * FROM `Class` WHERE courseCode=?", [courseCode], function(err, rows) {
        if (rows) {
            cb(err, rows);
        } else {
            cb(err);
        }
    });
};

db.getUserCourses = function(userCode, cb) {
    now.mysql.query("SELECT * FROM `User` WHERE code=?", [userCode], function(err, rows) {
        if (err) throw err;
        if (rows) {
            var user = rows[0];
            var courseCose = user.courseCodes.split(',');
            now.mysql.query("SELECT Course.code AS code, Course.name, Course.description, " +
                "Course.credits, Class.code as classCode, Class.day, Class.courseCode, Class.startTime, Class.endTime " +
                "FROM `Course` INNER JOIN `Class` ON Course.code=Class.courseCode WHERE Course.code IN (?)", [courseCose], function(err, rows) {
                if (err) throw err;
                if (rows) {
                    cb(err, getCourseClasses(rows), getCourses(rows));
                }
            });
        }
    });
};

function getCourseClasses(rows) {
    var coursesClasses = {};
    for (var i = 0 ; i < rows.length; i++) {
        var row = rows[i];
        if (!coursesClasses[row.courseCode]) {
            coursesClasses[row.courseCode] = [];
        }
        coursesClasses[row.courseCode].push({startTime: row.startTime, endTime: row.endTime, day: row.day})
    }
    return coursesClasses;
}

function getCourses(rows) {
    var keys = [];
    var courses = [];
    for (var i = 0 ; i < rows.length; i++) {
        var row = rows[i];
        if (keys.indexOf(row.code) == -1) {
            courses.push(row)
            keys.push(row.code)
        }
    }
    return courses;
}

db.saveUserCourses = function(userCode, courses, cb) {
    now.mysql.query("UPDATE `User` SET courseCodes=? WHERE code=?;", [courses, userCode], function(err, result) {
        if (err) throw err;
        cb(err);
    });
};
