var subscription = require('../controllers/subscription.server.controller');

module.exports = function (app) {
    'use strict';

    app.route('/subscription')
        .post(subscription.subscribe)
        .delete(subscription.unsubscribe);

    app.route('/subscription/:subscriberById/notifications')
        .get(subscription.subscriberNotifications, function (req, res) {
            var notifications = req.notifications;
            res.status(200).json(notifications);
        });

    app.route('/subscription/:subscriberById/notifications/icon/:iconPath')
        .get(subscription.markMessageAsRead,
             subscription.getSubcriberIcon,
             function (req, res) {
               var icon = req.icon;
               res.status(200).send(icon);
             });

    app.param(':iconPath', subscription.iconPath);
    app.param('subscriberById', subscription.subscriberById);
};
