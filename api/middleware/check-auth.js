const jwt = require('jsonwebtoken');
const atob = require('atob');
var AccessToken = require('../models/access_token');
var User = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(typeof token == "undefined")
             return res.status(401).json({
                message: "Missing token header in request"
            });

        const decoded = jwt.verify(token, "secret");
        var user = await User.findById(decoded.data._id);
        var access_token = await AccessToken.find({user: user});
        if(access_token.length > 0){
            if(access_token[0].access_token == token){
                req.userData = decoded;
                next();
            }
            else{
                throw err;
            }
        }
        else{
            throw err;
        }
        
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