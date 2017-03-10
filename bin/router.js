var express = require("express");
var router = express.Router();
var router_passport = require("./router_passport.js");

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
    input.subject = "Client Query";
    console.log(input.message);
    input.to = now.ini.gmail.user;
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
        console.log("")
        db.getClassesWithUser(req.user.code, function (err, classes) {
            if (err) throw err;
            res.render("classes", {classes: classes});
        })
    } else {
        db.getClasses(function(err, classes) {
            res.render("classes", {classes: classes});
        });
    }

});

router.get("/addClasses", function(req, res) {
    db.getClasses(function(err, classes) {
        console.log(classes);
        res.render("admin/admin_classes", {classes: classes});
    });

});

router.post("/removeStudent", function (req, res) {
    db.removeStudent(req.body, function (err) {
        if (err) throw err;
        res.send({info: "Done"});
    })
});

router.get("/students", function(req, res) {
    db.getClasses(function(err, classes) {
        res.render("admin/classes_manage", {classes: classes});
    });

});

router.post("/getStudents", function(req, res) {
    console.log("code" + req.body.classCode)
    db.getStudents(req.body.classCode, function(err, students) {
        console.log(students);
        res.send({students: students});
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

router.post("/saveCourses", function(req, res) {
    var courses = req.body.userCourses;
    db.saveUserCourses(req.user.code, courses, function(err) {
        if (err) throw err;
        res.send({info: "saved"});
        return;
    });
});

router.get("/**", function(req, res) {
    db.getClasses(function(err, classes) {
        res.redirect("/");
        return;
    });
});



