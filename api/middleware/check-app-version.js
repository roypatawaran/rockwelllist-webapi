const jwt = require('jsonwebtoken');
const atob = require('atob');
const AppVersion = require('../models/app_version');
const response_msgs = require('../utils/response_msgs');

module.exports = {
    checkVersion: async  (req, res, next) => {
        try {
            var iOSversion = parseFloat(req.headers['x-ios-version']);
            var androidVersion = parseFloat(req.headers['x-android-version']);
            var app_version = await AppVersion.findOne({});

            if(!Number.isNaN(iOSversion) && Number.isNaN(androidVersion)){
                if(iOSversion < app_version.IOS){
                    return res.status(426).send(response_msgs.error_msgs.NeedToUpdate);
                }
                else{
                    next();
                }
            }
            else if(!Number.isNaN(androidVersion) && Number.isNaN(iOSversion)){
                if(androidVersion < app_version.android){
                    return res.status(426).send(response_msgs.error_msgs.NeedToUpdate);
                }
                else{
                    next();
                }
            }
            else{
                return res.status(400).send(response_msgs.error_msgs.AppVersionInvalid);
            }
        } catch (error) {
            console.log(error);
            return res.status(400).send(response_msgs.error_msgs.AppVersionInvalid);
        }
    }
    
};