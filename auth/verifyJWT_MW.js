const verifyJWTToken = require('./verifyJWTToken');

const authorize = function (req, res, cb) {
    let token = (req.method === 'POST') ? req.body.token : req.query.token

    verifyJWTToken(token)
        .then((decodedToken) => {
            req.user = decodedToken.data
            cb()
        })
        .catch((err) => {
            console.log(err);
            res.status(400)
                .json({message: "Invalid auth token provided."})
        })
};

module.exports = authorize;


