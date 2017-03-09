var express = require("express");
var router = express.Router();
var passport = require('passport');
var path = require('path');
var LocalStrategy = require('passport-local').Strategy;

var now, db;

exports.init = function(_now, cb) {
    console.log("[routes]");
    _now.router = router;
    now = _now;
    db = now.db;
    setupPassport();
    now.web.use("/", router);
    cb();
};

router.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

router.get("/classes", function(req, res) {
    db.getClasses(function(err, classes) {
        res.render("classes", {classes: classes});
    });

});

router.get("/admin_classes", function(req, res) {
    db.getClasses(function(err, classes) {
        res.render("admin/admin_classes", {classes: classes});
    });

});

router.post("/addClass", function(req, res) {
    console.log("SAve Class router");
    db.saveClass(req.body, function(err) {
        if (err) throw err;
        res.redirect("admin_classes");
        return;
    });
});

router.post("/removeClass", function(req, res) {
    db.removeClass(req.body.code, function(err) {
        if (err) throw err;
        res.send("removed");
        return;
    });
});

router.get("/admin_classes",function(req, res) {
    //TODO check for permission
    res.render("admin/admin_classes");
});

router.get("/test",function(req, res) {
    //TODO check for permission
    res.render("test");
});

router.get("/", function(req, res) {
    res.render("index");
});

router.post("/userCourses", function(req, res) {
    db.getUserCourses(req.body.userCode, function(err, courseClasses, courses) {
        if (err) throw err;
        db.getCourses(function(err, availableCourses) {
            if (err) throw err;
            res.send({userCourses: courses, availableCourses: availableCourses, courseClasses: courseClasses});
        });
    });
});

router.get("/getCourses", function(req, res) {
    db.getCourses(function(err, rows) {
        res.send({courses: rows});
        return;
    });
});

router.get("/getClasses", function(req, res) {
    var course = req.query.course
    db.getClasses(course, function(err, rows) {
        res.send({classes: rows});
        return;
    });
});

router.post("/saveCourses", function(req, res) {
    var courses = req.body.userCourses;
    db.saveUserCourses(req.user.code, courses, function(err) {
        if (err) throw err;
        res.send({info: "saved"});
        return;
    });
});

function setupPassport() {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            db.getUserByEmail(email, function(err, row) {
                if (row && row.password === password) {
                    return done(err, row);
                }
                done(err, false);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    now.web.use(passport.initialize());
    now.web.use(passport.session());

    now.web.post('/login', function(req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        }, function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render('login', {
                    msg: "Wrong password!"
                });
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/');
            });
        })(req, res, next);
    });

    now.web.get("/login", function(req, res) {
        if(req.user && req.user.code) {
            res.redirect("/");
            return;
        }
        res.render("login");
    });

    now.web.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}



