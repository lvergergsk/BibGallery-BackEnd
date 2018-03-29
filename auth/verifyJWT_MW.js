const verifyJWTToken = require('./verifyJWTToken');

const verifyJWT_MW = function (req, res, next) {
    let token = (req.method === 'POST') ? req.body.token : req.query.token

    verifyJWTToken(token)
        .then((decodedToken) => {
            req.user = decodedToken.data
            next()
        })
        .catch((err) => {
            res.status(400)
                .json({message: "Invalid auth token provided."})
        })
};

module.exports = verifyJWT_MW;


