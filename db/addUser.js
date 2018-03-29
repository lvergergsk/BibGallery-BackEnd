'use strict';
const connection = require("./connection");
var bcrypt = require('bcrypt');
const async = require('async');

const registerQuery = function (username, hash, email, conn, cb) {
    conn.execute(`INSERT INTO users (USERNAME, HASH, EMAIL) VALUES (:username, :hash,:email)`,
        [username, hash, email],
        {autoCommit: true},
        function (err, result) {
            if (err) {
                return cb(err, conn);
            } else {
                return cb(null, conn);
            }
        });
};

const registerHandler = function (req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        async.waterfall(
            [
                connection.doconnect,
                async.apply(registerQuery, req.body.username, hash, req.body.email),
            ],
            function (err, conn) {
                if (err) {
                    console.error("In waterfall error cb: ==>", err, "<==");
                    res.status(400).json(
                        {
                            success: false
                        }
                    )
                } else {
                    res.status(200).json(
                        {
                            success: true
                        }
                    )

                }
                if (conn)
                    connection.dorelease(conn);
            });

    });
};

module.exports.registerHandler = registerHandler;