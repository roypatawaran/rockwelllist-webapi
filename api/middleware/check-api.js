const jwt = require('jsonwebtoken');
const atob = require('atob');
const api = require('../models/api');

module.exports = {
    checkAPIKey: async  (req, res, next) => {
        try {
            var api_key = req.headers['x-api-key'];
    
            if(typeof api_key == "undefined")
                return false;
            else
            {
                var _apiKey = await api.find({apiKey: api_key});
                if(!Object.keys(_apiKey).length)
                    return res.status(401).json({
                        message: "API Key is invalid."
                    });
                else
                {
                    console.log("API Key is valid");
                    next();
                }
            }
        } catch (error) {
            return res.status(401).json({
                message: "API Key is invalid."
            });
        }
    }
    
};