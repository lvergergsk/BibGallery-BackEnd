const jwt = require('jsonwebtoken');
const _ = require('lodash');

let createJWTToken = function (username) {
    let details = {};

    if (!details.maxAge || typeof details.maxAge !== 'number') {
        details.maxAge = 3600
    }

    details.sessionData = _.reduce(details.sessionData || {}, (memo, val, key) => {
        if (typeof val !== "function" && key !== "password") {
            memo[key] = val
        }
        return memo
    }, {});

    return jwt.sign({
        username: username,
        // data: details.sessionData
    }, process.env.JWT_SECRET, {
        expiresIn: details.maxAge,
        algorithm: 'HS256'
    })
};

module.exports = createJWTToken;