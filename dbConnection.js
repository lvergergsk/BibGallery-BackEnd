var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./db/dbConfig.js');

var doconnect = function (cb) {
    oracledb.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        cb);
};

var dorelease = function (conn) {
    conn.close(function (err) {
        if (err)
            console.error(err.message);
    });
};

var doquery_object = function (conn, cb) {
    conn.execute(
        "SELECT * FROM\n" +
        "  (SELECT * FROM PAPER\n" +
        "   ORDER BY YEAR DESC)\n" +
        "WHERE ROWNUM <= 1",
        {},
        {outFormat: oracledb.OBJECT}, // outFormat can be OBJECT or ARRAY.  The default is ARRAY
        function (err, result) {
            if (err) {
                return cb(err, conn);
            } else {
                console.log(result.rows);
                return cb(null, conn);
            }
        });
};


async.waterfall(
    [
        doconnect,
        doquery_object
    ],
    function (err, conn) {
        if (err) {
            console.error("In waterfall error cb: ==>", err, "<==");
        }
        if (conn)
            dorelease(conn);
    }
);

exports.doConnect = doconnect;
exports.doRelease = dorelease;