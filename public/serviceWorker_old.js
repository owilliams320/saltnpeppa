"use strict";

var _roostSW = {
    version: 1,
    logging: true,
    appKey: "b0c6e44714304c5697b13ff4dcd7c3ad",
    host: "https://web-notify.citrix.com"
};

self.addEventListener('install', function (evt) {
    //Automatically take over the previous worker.
    evt.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (evt) {
    if (_roostSW.logging) {console.log("Activated Roost ServiceWorker version: " + _roostSW.version); }
});

//Handle the push received event.
self.addEventListener('push', function (evt) {

    console.log('sniff sniff');

    if (_roostSW.logging) {console.log("push listener", evt); }
    evt.waitUntil(self.registration.pushManager.getSubscription().then(function(subscription) {
        console.log(subscription);
        return fetch(_roostSW.host + "/subscription/" + subscription.endpoint.replace('https://android.googleapis.com/gcm/send/', '') + "/notifications").then(function(response) {
            return response.json().then(function(json) {
                if (_roostSW.logging) {console.log(json); }
                var promises = [];
                for (var i = 0; i < json.length; i++) {
                    var note = json[i];
                    if (_roostSW.logging) console.log("Showing notification: " + note.body);
                    promises.push(showNotification(note.title, note.body, note.endpoint, subscription.endpoint.replace('https://android.googleapis.com/gcm/send/', ''), note.tag, note.broadcast));
                }
                return Promise.all(promises);
            });
        });
    }));
});

self.addEventListener('notificationclick', function(evt) {
    if (_roostSW.logging) console.log("notificationclick listener", evt);
    evt.waitUntil(handleNotificationClick(evt));
});

function parseQueryString(queryString) {
    var qd = {};
    queryString.split("&").forEach(function (item) {
        var parts = item.split("=");
        var k = parts[0];
        var v = decodeURIComponent(parts[1]);
        (k in qd) ? qd[k].push(v) : qd[k] = [v, ]
    });
    return qd;
}

//Utility function to handle the click
function handleNotificationClick(evt) {
    if (_roostSW.logging) console.log("Notification clicked: ", evt.notification);
    evt.notification.close();
    var iconURL = evt.notification.icon;
    if (iconURL.indexOf("?") > -1) {
        var queryString = iconURL.split("?")[1];
        var query = parseQueryString(queryString);
        if (query.url && query.url.length == 1) {
            if (_roostSW.logging) console.log("Opening URL: " + query.url[0]);
            return clients.openWindow(query.url[0]);
        }
    }
    console.log("Failed to redirect to notification for iconURL: " + iconURL);
}

//Utility function to actually show the notification.
function showNotification(title, body, url, subscriptionId, tag, broadcast) {
    var options = {
        body: body,
        tag: tag,
        icon: _roostSW.host + '/subscription/' + subscriptionId + '/notifications/icon?broadcast=' + broadcast
    }

    console.log(self.registration)

    return self.registration.showNotification(title, options);
}