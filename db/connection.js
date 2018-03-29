"use strict";

// const async = require('async');
const oracledb = require("oracledb");
const dbConfig = require('./dbConfig.js');

const doconnect = function (cb) {
    oracledb.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        cb);
};

const dorelease = function (conn) {
    conn.close(function (err) {
        if (err)
            console.error(err.message);
    });
};

const exampleQuery = function (conn, cb) {
    conn.execute(`SELECT owner,table_name FROM all_tables`, function (err, result) {
        if (err) return (err, conn)
        else {
            console.log(result.rows);
            return (null, cb);
        }
    })
};

// async.waterfall(
//     [
//         doconnect,
//         exampleQuery,
//         dorelease
//     ],
//     function (err, conn) {
//         if (err) {
//             console.error("In waterfall error cb: ==>", err, "<==");
//         }
//         if (conn)
//             dorelease(conn);
//     });

module.exports.doconnect = doconnect;
module.exports.dorelease = dorelease;