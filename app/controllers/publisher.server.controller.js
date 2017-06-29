/*
** Express Route controller for publishing notifications
**
*/
const Notifications = require('mongoose').model('notifications');
const gcmRequest = require('./gcm.server.controller');
const cronJob = require('cron').CronJob;


//send message to Google Cloud Messaging
exports.sendGCMRequest = function (req, res, next) {
    var subscribers = req.gcmSubscribers || req.subscriber.subscriptionId;
    var notification = req.notification;

    if(!notification) {
        return next('No notification set');
    } else if (!subscribers) {
        return next('No subscribers set');
    }

    gcmRequest.send(subscribers, notification, function(err, broadcast){
        if (err) {
          return next(err);
        }

        req.broadcast = broadcast;

        next();
    });
};

//send scheduled recurring or one time message to Google Cloud Messaging
exports.sendScheduledGCMRequest = function (req, res, next) {
    var subscribers = req.gcmSubscribers;
    var notification = req.notification;
    var cronTime = req.body.scheduleDate;

    if (!cronTime) {
        next('cron time not set');
    }

    try {
        //Tea Time :{
        //0 14 * * 1-5
        req.job = new cronJob(cronTime, function () {
            gcmRequest.send(subscribers, function(broadcast){
                req.broadcast = broadcast;
            });
        }, null, true, "America/Los_Angeles");
        next();
    } catch (ex) {
        next(ex);
    }
};
