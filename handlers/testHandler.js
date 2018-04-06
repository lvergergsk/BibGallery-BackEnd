const testHandler = function(req, res) {
    if (!req.user) return res.sendStatus(401);
    console.log(req.user);
    res.status(200).json({
        success: true,
        message: "You've reached a protected page"
    });
};

module.exports = testHandler;
