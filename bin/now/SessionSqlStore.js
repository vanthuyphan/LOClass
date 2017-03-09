var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Store = require('express-session').Store;

function SessionSqlStore(options) {
  	Store.call(this);
    if (!options || !options.now) {
        throw new Exception("now.mysql doesn't exist!");
    }
    this.timeout = options.timeout || 0;
    this.now = options.now;
};

util.inherits(SessionSqlStore, EventEmitter);
util.inherits(SessionSqlStore, Store);

SessionSqlStore.prototype.get = function(sid, callback) {
    this.now.mysql.query("SELECT data,dtime FROM _SessionSqlStore WHERE id=?", sid, function(err, rows) {
        if (err) return callback(err);
        if (!rows || rows.length == 0) {
            return callback();
        }
        var data = JSON.parse(rows[0].data);
        callback(null, data);
    });
};

SessionSqlStore.prototype.destroy = function(sid, callback) {
    this.now.mysql.query("DELETE FROM _SessionSqlStore WHERE id=?", [sid], callback);
};

SessionSqlStore.prototype.set = function(sid, session, callback) {
    var values = {
        id: sid,
        data: JSON.stringify(session),
        dtime: this.timeout === 0 ? 0 : Date.now() + this.timeout
    };
    this.now.mysql.query("INSERT INTO _SessionSqlStore(id,data,dtime) VALUES (?,?,?) ON DUPLICATE KEY UPDATE data=?, dtime=?", [values.id, values.data, values.dtime, values.data, values.dtime], callback);
};

SessionSqlStore.prototype.touch = function(sid, session, callback) {
    if (this.timeout === 0) {
        return callback();
    }
    this.now.mysql.query("UPDATE _SessionSqlStore SET dtime=? WHERE id=?", [Date.now() + this.timeout, sid], callback);
};

module.exports = SessionSqlStore;
