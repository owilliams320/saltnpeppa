/*
** Express Route controller for managing notifications to send to a channel/user
**
*/

var Notification = require('mongoose').model('notifications');

exports.create = function (req, res, next) {
    var notification = new Notification(req.body);

    notification.save(function (err) {
    	if (err) {
            return next(err);
    	} else {
            res.redirect('/dashboard');
        }
    });
};

exports.list = function (req, res, next) {
    Notification.find({}, function (err, notifications) {
        if (err) {
            return next(err);
        } else {
            res.render('notifications', {notifications:notifications});
        }
    });
};

exports.read = function (req, res) {
    res.json(req.notification);
};

exports.update = function (req, res, next) {
    Notification.findByIdAndUpdate(req.notification.id, req.body, function (err, notification) {
        if (err) {
            return next(err);
        } else {
            res.json(notification);
        }
    });
};

exports.delete = function (req, res, next) {
    Notification.findByIdAndRemove(req.notification.id, req.body, function (err, notification) {
        if (err) {
            return next(err);
        } else {
            res.json(notification);
        }
    });
};

exports.allNotifications = function (req, res, next) {
    Notification.find({}, function (err, notifications) {
        if (err) {
            return next(err);
        } else {
           req.notifications = notifications;
           next();
        }
    });
};

exports.notificationById = function (req, res, next, id) {
    Notification.findOne({'_id': id}, 'title body endpoint icon tag', function (err, notification) {
        if (err) {
            return next(err);
        }
        
        req.notification = notification;
        next();
    });
};

exports.addBroadcastData = function (req, res, next) {
    var broadcast = req.broadcast;
    var notification = req.notification;

    Notification.findByIdAndUpdate(notification._id, {$push:{broadcasts: broadcast}}, function (err) {
        if (err) return next(err);

        next();
    });
};
