const connection = require("../db/connection");
const async = require('async');
const createJWTToken = require('../auth/createJWTToken');
const bcrypt = require('bcrypt');

const checkUser = function (username, conn, cb) {
    conn.execute(`SELECT HASH FROM YOULYU.USERS WHERE YOULYU.USERS.USERNAME=:username`,
        [username],
        {autoCommit: true},
        function (err, result) {
            hash = result.rows[0][0];
            if (err) {
                return cb(err, conn);
            } else {
                return cb(null, hash, conn)
            }
        });
};

const compareHash = function (password, hash, conn, cb) {
    bcrypt.compare(password, hash, function (err, res) {
        if (err) {
            return cb(err, false, conn);
        } else {
            return cb(null, res, conn);
        }
    });
}

const loginHandler = function (req, res) {

    async.waterfall(
        [
            connection.doconnect,
            async.apply(checkUser, req.body.username),
            async.apply(compareHash, req.body.password)
        ],
        function (err, success, conn) {
            if (err) {
                console.error("In waterfall error cb: ==>", err, "<==");
                res.status(400).json(
                    {
                        success: false
                    }
                )
            } else {
                if (success) {
                    res.status(200).json(
                        {
                            success: true,
                            JWT: createJWTToken(req.body.username)
                        }
                    )
                } else {
                    res.status(400).json(
                        {
                            success: false,
                            error: "Username or password is not correct."
                        }
                    )
                }

            }
            if (conn)
                connection.dorelease(conn);
        });
};

module.exports = loginHandler;