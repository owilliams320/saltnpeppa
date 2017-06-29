/*
**
** Express Route controllers to manage user subcriptions
**
**
*/

const Subcription = require('mongoose').model('subscription');
const Notifications = require('mongoose').model('notifications');
const fs = require('fs');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');

exports.subscribe = function (req, res, next) {
	let subscriptionId = req.body.subscriptionId;
	Subcription.findOneAndUpdate({subscriptionId:subscriptionId}, {subscriptionId:subscriptionId}, {new: true, upsert: true}, function (err, doc) {
		if (err) {
			return next(err);
		} else {
			res.status(200).json(doc);
		}
	});
};

exports.unsubscribe = function (req, res, next) {
	Subcription.findOneAndRemove(req.body, function (err, doc) {
		if (err) {
      return next(err);
		} else {
			res.status(200).json(doc);
		}
	});
};

exports.allSubscribers = function (req, res, next) {
    Subcription.find({}, function (err, subscribers) {
        if (err) {
            return next(err);
        } else {
            req.subscribers = subscribers;
            next();
        }
    });
};

exports.allGCMSubscriptions = function (req, res, next) {
    let subscriptionArr = [];
    Subcription.find({}, {_id:0, subscriptionId:1}, function(err, subscriptions){
        if (err) {
					return next(err);
        } else {
					subscriptions.forEach((subscription)=>{
						if(subscription.subscriptionId){
								subscriptionArr.push(subscription.subscriptionId);
						}
					});
          req.gcmSubscribers = subscriptionArr;
          next();
        }
    });
};

exports.subscriberNotifications = function (req, res, next) {
    let subscriber = req.subscriber;
    let subscriberNotifications = subscriber.notifications.filter(function(notification){
			return notification.read === 0;
		});
    let unreadNotificationIds = [];
    let projectionObj = { title: 1, body: 1, icon: 1};

		subscriberNotifications.forEach((subscriberNotification)=>{
			console.log(subscriberNotification);
			if (unreadNotificationIds.indexOf(subscriberNotification.id.toHexString()) === -1) {
					unreadNotificationIds.push(subscriberNotification.id.toHexString());
			}
		});

		console.log('Looking up unread notifications ', unreadNotificationIds)

    Notifications.find({'_id': { $in: unreadNotificationIds} }, projectionObj, function (err, result) {
			  var nots = [];
        if (err) {
            return next(err);
        } else {

					subscriberNotifications.forEach(function(sn){
						let notification = _.find(result, '_id', sn.id);

						nots.push({
							title: notification.title,
							icon: notification.icon,
							body: notification.body,
							broadcast: sn.broadcast,
						});
					});

          req.notifications = nots;
          next();
        }
    });
};

exports.addNotificationById = function (req, res, next) {
    let subscriber = req.subscriber;
    let notification = req.notification;
    let notificationObj = {
				id: notification._id,
				broadcast: uuidv4(),
				read:0
		}

    console.log('adding notification to subscriber/subscribers');

    Subcription.findByIdAndUpdate(subscriber.id, { $addToSet:{ notifications: notificationObj } }, function (err, subscriber) {
        if (err) {
            return next(err);
        }
        next();
    });
};

exports.addNotificationAllGCM = function (req, res, next) {
    let subscriptionArr = [];
    let bulk = Subcription.collection.initializeOrderedBulkOp();
    let bulkOpCnt = 0;
    let notification = req.notification;
    let broadcast = req.broadcast;
		let notificationObj = {
				id: notification._id,
				broadcast: uuidv4(),
				read:0
		};

    console.log('adding notification to subscriber/subscribers');

    Subcription.find({}, function(err, subscribers) {
        if (err) {
            return next(err);
        }

				subscribers.forEach((subscriber)=>{
					if(!subscriber.subscriptionId){ return; }

					subscriptionArr.push(subscriber.subscriptionId);
					bulk.find({'_id': subscriber._id}).update({$addToSet: {notifications:  notificationObj}});
					bulkOpCnt++;
				});

        if (bulkOpCnt > 0) {
            bulk.execute(function (err, result) {
                if (err) return next(err);

								console.log('bulk execute finished', result)
                next();
            });
        } else {
            next();
        }
    });
};

exports.markMessageAsRead = function (req, res, next) {
	  let subscriber = req.subscriber;
    let notifications = req.subscriber.notifications;
    let broadcastId = req.query.broadcast;

    console.log('mark ' + broadcastId + ' message as read from' + subscriber._id);

		notifications.forEach((notification)=>{
			//mark notification as read in subscriber document
			if (notification && (notification.broadcast == broadcastId)) {
					notification.read = 1;
			}
		});

    Subcription.findByIdAndUpdate(subscriber._id, {'notifications':notifications}, function (err, update) {
        if (err) return next(err);
        next(null, update);
    });
};

exports.getSubcriberIcon = function (req, res, next) {
	  iconBasePath = './public/';
		iconPath = req.iconPath + '.png';

		fs.readFile(iconBasePath + iconPath, (err, data)=>{
			  //TODO: Handle 404 err
				if (err) return next(err);

				res.writeHead(200, {'Content-Type': 'image/png' });
				res.end(data, 'binary');
		});
};

exports.cleanGCMSubcriberList = function (req, res, next) {
    let subscriptions = req.gcmSubscribers;
    let broadcast = req.broadcast;

    if (!subscriptions || !broadcast) {
        return next();
    }

    Subcription.cleanGCMSubcriberList(subscriptions, broadcast.results, function(err, cleanList){
        if (err) return next(err);

        //Add broadcast
        cleanList['broadcast_results'] = broadcast;
        cleanList['subscribers'] = subscriptions;

        //Add cleanlist to request
        req.cleanList = cleanList;

        next();
    });
};

exports.subscriberById = function (req, res, next, id) {
    Subcription.findOne({'subscriptionId': id}, function (err, subscriber) {
        if (err) {
            return next(err);
        } else {
            req.subscriber = subscriber;
            next();
        }
    });
};

exports.iconPath = function(req, res, next, path){
	req.iconPath = path;
	next();
};
