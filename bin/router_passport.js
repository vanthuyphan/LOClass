var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var crypto = require("./crypto.js");
var mailer = require("./mailer.js");

var now, db;

exports.init = function (_now, cb) {
    now = _now;
    db = now.db;

    setupPassport();
    setupRegister();
    cb();
}


function setupRegister() {

    function checkLogged(req, res, next) {
        if (req.user && req.user.code) {
            console.info(req.user);
            res.redirect("/");
            return;
        }
        next();
    }

    now.web.get("/register", checkLogged, function (req, res) {
        var model;
        console.log(req.query);
        if (req.query.classCode) {
            db.getClass(req.query.classCode, function(err, clazz) {
                res.render('signup', {claz: clazz})
            });
        } else {
            if (req.user && req.user.oauth) {

                model = req.user.oauth.profile;
            }
            res.render("signup", model);
        }
    });

    now.web.post("/register", checkLogged, function (req, res, next) {
        console.log(req.body);
        var input = req.body;

        if (!input.first_name || !input.last_name || !input.email || !input.password) {
            req.body.registerMess = "Please fill in all the information";
            res.render("signup", req.body);
        }

        if (req.user && req.user.oauth)  {
            req.body.verified = true;
        } else {
            req.body.verified = false;
        }
        db.insertUser(req.body, function (err, row) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    req.body.registerMess = "There is already an account with this email address. Please login";
                    res.render("signup", req.body);
                    return;
                }
                next(err);
            }


            if (!req.user || !req.user.oauth) {
                if (req.body.classCode) {
                    row.subject = "Your Loan Originator Class Registration";
                    row.name = row.first_name;
                    now.db.getClass(req.body.classCode, function (err, claz) {
                        row.location = claz.location;
                        row.datetime = claz.datetime;
                        row.url = now.ini.web.url + '/view_class?code=' + crypto.encrypt(row.code.toString()) + '&classCode=' + claz.code;
                        row.url = encodeURI(row.url);
                        res.render("info", {"message": "Please check your mailbox for further instruction"});
                        now.mailer.sendMail(row, "class_registration", function (err) {
                            if (err) {
                                res.render("error");
                                throw err;
                            } else {
                                res.render("info", {"message": "Please check your mailbox for further instruction"});
                            }
                        })
                    })
                } else {
                    row.subject = "Activate Your Account";
                    row.name = row.first_name;
                    row.code = crypto.encrypt(row.code.toString());
                    now.mailer.sendMail(row, "activateAccount", function (err) {
                        if (err) {
                            res.render("error");
                            throw err;
                        } else {
                            res.render("info", {"message": "Please check your mailbox for further instruction"});
                        }
                    })
                }
                return;
            }

            if (req.body.email === req.user.oauth.profile.email) {
                db.insertOauth({
                    userCode: row.code,
                    profileId: req.user.oauth.profile.id,
                    provider: req.user.oauth.provider
                }, function (err) {
                    if (err) return next(err);

                    req.session.passport.user = req.body;
                    res.redirect("/");
                });
                return;
            }

            res.redirect("/");
        });
    });

    now.web.get("/login", checkLogged, function (req, res) {
        res.render("login");
    });

    now.web.get("/activate", checkLogged, function (req, res) {
        db.verifyUser(crypto.decrypt(req.query.code), function(err) {
            if (err) {
                throw err;
            } else {
                res.render("login", {info: "Your account is verified. Please log in"});
            }
        })
    });

    now.web.get("/forgot", checkLogged, function (req, res) {
        res.render("forgot", {email: req.email});
    });

    now.web.post("/change_password", checkLogged, function (req, res) {
        var user = req.body;
        db.changePassword(user.email, user.password, function (err) {
            if (!err) {
                res.render("login", {info: "Your password has been changed. Please login"});
            } else {
                res.render("error");
                throw err;
            }
        });
    });

    now.web.get("/reset_password", checkLogged, function (req, res) {
        var user = req.query;
        var decryptedCode = crypto.decrypt(user.code).split('&');
        var code = decryptedCode[1];
        var expiredDate = new Date(decryptedCode[0]);
        if (expiredDate < new Date()) {
            res.send("Expired request");
            return;
        }
        console.log(code);
        db.getUserByCode(code, function (err, row) {
            if (!row) {
                res.send("Invalid request");
            } else {
                res.render("changePassword", {"email" : row.email});
            }
        });
    });

    now.web.post("/forgot", checkLogged, function (req, res) {
        var email = req.body.email;
        if (!email) {
            req.body.msg = "Please enter your email";
            res.render("forgot", req.body);
            return;
        } else {
            db.getUserByEmail(email, function (err, row) {
                if (err) {
                    throw err;
                }
                if (!row) {
                    req.body.msg = "This email address in not in the system";
                    res.render("forgot", req.body);
                    return;
                } else {
                    row.subject = "Reset Password";
                    var date = new Date();
                    var expiredDate = date.setDate(date.getDate() + 1);
                    row.code = crypto.encrypt(expiredDate.toString() + "&" + row.code);
                    row.name = row.first_name;
                    now.mailer.sendMail(row, "forgotPassword", function (err) {
                        if (err) {
                            res.render("error");
                            throw err;
                        } else {
                            res.render("info", {message: "Please check your mailbox for further instruction"});
                        }
                    })
                }
            });
        }
    });
}


function setupPassport() {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            db.getUserByEmail(email, function (err, row) {
                if (row && row.password === password) {
                    return done(err, row);
                }
                done(err, false);
            });
        }
    ));

    function loginOrRegisterOauth(oauthProfile, done) {
        now.db.getUserByEmail(oauthProfile.profile.email, function (err, row) {
            if (err) return done(err);

            if (row) {

                now.db.insertOauth({
                    userCode: row.code,
                    profileId: oauthProfile.profile.id,
                    provider: oauthProfile.provider
                }, function () {
                });

                done(null, row);
                return;
            }

            done(null, {
                oauth: oauthProfile
            });

        });
    };

    function exportOauthProfile(provider, profile) {
        // console.debug(profile);
        return {
            provider: provider,
            profile: {
                id: profile.id,
                name: profile.displayName,
                gender: profile.gender ? (profile.gender == 'male' ? 1 : 2) : 0,
                email: (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : ""
            }
        };
    };

    passport.use(new FacebookStrategy({
            clientID: now.ini.facebook.appId,
            clientSecret: now.ini.facebook.appSecret,
            callbackURL: now.ini.web.url + "/login/facebook/callback",
            enableProof: false,
            profileFields: ['id', 'displayName', 'photos', 'emails'],
            passReqToCallback: true
        },
        function (request, accessToken, refreshToken, profile, done) {
            loginOrRegisterOauth(exportOauthProfile("facebook", profile), done);
        }
    ));

    passport.use(new GoogleStrategy({
            clientID: now.ini.google.clientId,
            clientSecret: now.ini.google.clientSecret,
            callbackURL: now.ini.web.url + "/login/google/callback",
            profileFields: ['id', 'displayName', 'photos', 'emails'],
            passReqToCallback: true
        },
        function (request, accessToken, refreshToken, profile, done) {
            loginOrRegisterOauth(exportOauthProfile("google", profile), done);
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
    now.web.use(passport.initialize());
    now.web.use(passport.session());

    now.web.get('/login/facebook',
        passport.authenticate('facebook', {
            scope: ["email"]
        }));

    now.web.get('/login/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/login'
        }),
        function (req, res) {
            if (req.user.code) {
                res.redirect("/");
                return;
            }
            res.redirect("/register");
        });

    now.web.get('/login/google', passport.authenticate('google', {
        scope: ['email', 'profile']

        // scope: ['https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/plus.login', ]
    }));

    now.web.get('/login/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/login'
        }),
        function (req, res) {
            if (req.user.code) {
                res.redirect("/");
                return;
            }
            res.redirect("/register");
        });

    now.web.post('/login', function (req, res, next) {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        }, function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render('login', {
                    loginMess: "Wrong password!"
                });
            }
            if (!user.verified) {
                return res.render('login', {
                    loginMess: "Your account has not been activated yet!"
                });
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/classes');
            });
        })(req, res, next);
    });

    now.web.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
}
