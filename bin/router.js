var express = require("express");
var router = express.Router();
var router_passport = require("./router_passport.js");
var crypto = require("./crypto.js");

var now, db;

var path = require('path');

exports.init = function(_now, cb) {
    console.log("[routes]");

    _now.router = router;

    now = _now;
    db = now.db;

    router_passport.init(now, function(err) {
        if (err) throw err;

        now.web.use("/", router);
        cb();
    });
};

router.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

router.post("/sendMessage", function(req, res) {
    var input = req.body;
    input.subject = "Client Query" + input.subject;
    input.to = now.ini.gmail.user;
    input.name = 'Thuan',
    now.mailer.sendMail(input, "clientQuery", function(err) {
        if (err) throw err;
        res.render("info", { "message": "Thank you. Got the message. Get back to you soon" });
    })
});

router.post("/registerClass", function(req, res) {
    db.registerClass(req.body, function(err) {
        res.send({info: "Registered"});
    });
});

router.post("/unRegisterClass", function (req, res) {
    console.log("Cofsdfsdde" + req.body.code);
    db.unregisterClass(req.body, function(err) {
        if (err) throw err;
        console.log("Code" + req.body.code);
        res.send({info: "UnRegistered"});
    });
})

router.get("/about", function(req, res) {
    res.render("about");
});

router.get("/account", function(req, res) {
    res.render("account");
});


router.get("/classes", function(req, res) {
    if (req.user && req.user.code) {
        db.getClassesWithUser(req.user.code, function (err, classes) {
            if (err) throw err;
            console.log(classes);
            res.render("classes", {classes: classes, tab: req.query.tab});
        })
    } else {
        db.getClasses(function(err, classes) {
            res.render("classes", {classes: classes, tab: req.query.tab});
        });
    }

});

router.get("/addClasses", function(req, res) {
    db.getClasses(function(err, classes) {
        res.render("admin/admin_classes", {classes: classes});
    });

});

router.post("/removeStudent", function (req, res) {
    db.removeStudent(req.body, function (err) {
        if (err) throw err;
        res.send({info: "Done"});
    })
});

router.post("/get_user", function(req, res) {
    db.getUserByCode(req.body.code, function(err, user) {
        console.log(user)
        res.send({user: user});
    });
});

router.get("/students", function(req, res) {
    db.getClasses(function(err, classes) {
        res.render("admin/classes_manage", {classes: classes});
    });

});

router.post("/get_students", function(req, res) {
    db.getStudents(req.body.classCode, function(err, students) {
        res.send({students: students});
    });
});

router.post("/addClass", function(req, res) {
    db.saveClass(req.body, function(err) {
        if (err) throw err;
        res.redirect("addClasses");
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

router.get("/", function(req, res) {
    db.getClasses(function(err, classes) {
        res.render("index", {classes: classes});
    });
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

router.get("/email_history", function(req, res) {
    db.getEmailHistories(function(err, rows) {
        if (err) throw err;
        res.render("admin/email_history", {histories: rows});
    });
});

router.post("/updateClass", function(req, res) {
    db.updateClass(req.body, function(err, rows) {
        if (err) throw err
        res.redirect('addClasses')
        return;
    });
});

router.post("/get_email", function(req, res) {
    db.getEmail(req.body.code, function(err, email) {
        if (err) throw err;
        res.send({email: email});
        return;
    });
});

router.post("/save_note", function(req, res) {
    db.saveNote(req.body, function(err) {
        if (err) throw err;
        console.log("Done")
        res.send({info: "saved"});
        return;
    });
});

router.post("/email_students", function(req, res) {
    db.getStudents(req.body.classCode, function(err, students) {
        now.mailer.sendToMany(students, req.body, function (err) {
            res.send({info: "Send"});
        });
    });
});

router.post("/update_user", function(req, res) {
    db.updateUser(req.user.code, req.body, function(err) {
        if (err) throw err;
        res.redirect('/logout');
        return;
    });
});

router.get('/view_class', function (req, res) {
    var code = crypto.decrypt(req.query.code);
    db.verifyUser(code, function(err) {
        if (err) {
            throw err;
        } else {
            var model = {};
            model.classCode = req.query.classCode;
            model.userCode = code;
            db.registerClass(model, function (error) {
                if (error) throw err;
                if (req.user && req.user.code) {
                    res.redirect('/classes');
                    return;
                } else {
                    res.render('login', {info: "You have successfully registered your class. Please login to view it"});
                }
            })
        }
    })
})

router.get("/**", function(req, res) {
    db.getClasses(function(err, classes) {
        res.redirect("/");
        return;
    });
});



