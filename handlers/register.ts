// $Algorithm$AlgorithmOption$Salt.Hash
// bcrypt has maximum length for plain string
// hashed string length = 60

import * as bcrypt from "bcrypt";

export function registerHandler(req, res) {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            console.log(err);
            res.status(400).json({success: false});
        }
        else {
            console.log(hash);
            res.status(200).json({success: true});
        }
    })
}


//
// bcrypt.compare("testPassword", "$2a$10$gbJooZhnutoL5wsYmoiIW.YOHjVyJ.w3jwIlPpW3kgTodShQC9mJa", function(err, res) {
//     console.log(err);
//     console.log(res);
// });