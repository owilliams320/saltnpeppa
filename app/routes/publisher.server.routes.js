var publisher = require('../controllers/publisher.server.controller'),
    notifications = require('../controllers/notifications.server.controller'),
    subscription = require('../controllers/subscription.server.controller'),
    users = require('../controllers/users.server.controller');

module.exports = function (app) {
    
    //Route publish notification to all GCM users
    app.route('/publisher/publish/:notificationId/allGCM')
        .get(users.isAuthenticated,
             subscription.allGCMSubscriptions,
             subscription.addNotificationAllGCM,
             publisher.sendGCMRequest,
             notifications.addBroadcastData,
             subscription.cleanGCMSubcriberList,
             function (req, res) {
                res.status(200).json(req.cleanList);
             });

    //Route publish notification to user by subscriberId
    app.route('/publisher/publish/:notificationId/:subscriberById')
       .get(users.isAuthenticated,
            subscription.addNotificationById,
            publisher.sendGCMRequest,
            notifications.addBroadcastData,
            subscription.cleanGCMSubcriberList,
            function (req, res) {
                res.status(200).json(req.cleanList);
            });

    //Route scheduled publish notification to all GCM users
    app.route('/publisher/schedule/:notificationId/allGCM')
       .post(users.isAuthenticated,
             subscription.allGCMSubscriptions,
             subscription.addNotificationAllGCM,
             publisher.sendScheduledGCMRequest,
             notifications.addBroadcastData,
             subscription.cleanGCMSubcriberList,
             function (req, res) {
                res.status(200).json(req.cleanList);
             });
};
