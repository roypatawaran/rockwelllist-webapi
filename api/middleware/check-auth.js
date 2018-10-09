const jwt = require('jsonwebtoken');
const atob = require('atob');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(typeof token == "undefined")
             return res.status(401).json({
                message: "Missing token header in request"
            });

        const decoded = jwt.verify(token, "secret");
        req.userData = decoded;
        next();
    } catch (error) {
        if(error.message.indexOf("split") > -1)
        {
            return res.status(403).json({
                message: "Missing token header in request"
            });
        }
        return res.status(403).json({
            message: "Incorrect authentication token supplied"
        });
    }
};