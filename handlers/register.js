"use strict";
// $Algorithm$AlgorithmOption$Salt.Hash
// bcrypt has maximum length for plain string
// hashed string length = 60
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt = require("bcrypt");
function registerHandler(req, res) {
    bcrypt.hash(req.body.password, 10, function (err, hash) {
        if (err) {
            console.log(err);
            res.status(400).json({ success: false });
        }
        else {
            console.log(hash);
            res.status(200).json({ success: true });
        }
    });
}
exports.registerHandler = registerHandler;
//
// bcrypt.compare("testPassword", "$2a$10$gbJooZhnutoL5wsYmoiIW.YOHjVyJ.w3jwIlPpW3kgTodShQC9mJa", function(err, res) {
//     console.log(err);
//     console.log(res);
// }); 
