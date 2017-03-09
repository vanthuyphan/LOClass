var express = require("express");
var web = express();
var fs = require("fs");
var http = require('http');
var https = require('https');

var SessionSqlStore = require("./now/SessionSqlStore");
var session = require('express-session');

var bodyParser = require("body-parser");

var router = require("./router");


var now = {};


var server = http.createServer(web);

function setup() {
    web.set('view engine', 'jade');
    web.use("/bower_components", express.static("bower_components"));
    web.use("/public", express.static("public"));
    web.locals.pretty = true;

    web.use(bodyParser.urlencoded({extended: false}));
    web.use(bodyParser.json());

    web.use(session({
        resave: false,
        saveUninitialized: true,
        secret: 'blablablabla',
        store: new SessionSqlStore({
            now: now,
            timeout: 3000
        })
    }));
};

exports.init = function (_now, cb) {
    now = _now;

    console.log("[web]  %s:%s", now.ini.web.host, now.ini.web.port);

    now.web = web;
    setup();

    router.init(now, function (err) {
        if (err) throw err;


        now.router.use(function (err, req, res, next) {
            console.error(err.stack);
            res.status(500).send("System errror!");
            req.next(err);
        });

        server.listen(now.ini.web.port, now.ini.web.host, function (err) {
            if (err) throw err;

            cb();
        });
    });
};