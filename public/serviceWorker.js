/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

/* eslint-disable max-len */

const applicationServerPublicKey = 'BLbLtasv6zKE7Cf-Zl0hpYFpwolnFCpw3OQODeOth_hUsrP9RvcY5BG1OZlaLIwY2O3YRAZ5AhM3y_WpE_W04Eo';
const config = {
    version: 1,
    logging: true,
    appKey: "b0c6e44714304c5697b13ff4dcd7c3ad",
    host: "https://localhost:8443"
};
/* eslint-enable max-len */

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

//Handle the push received event.
self.addEventListener('push', function (evt) {

    console.log('sniff sniff', evt);

    evt.waitUntil(self.registration.pushManager.getSubscription().then(function(subscription) {
        var url = config.host + "/subscription/" + subscription.endpoint.replace('https://android.googleapis.com/gcm/send/', '') + "/notifications";

        console.log(url);

        return fetch(url).catch(function(err){console.error(err)}).then(function(response) {
          if (!response) { return;}
            return response.json().then(function(json) {
                if (config.logging) {console.log(json); }
                var promises = [];
                for (var i = 0; i < json.length; i++) {
                    var note = json[i];
                    if (config.logging) console.log("Showing notification: " + note.body);
                    promises.push(showNotification(note.title, note.body, note.endpoint, subscription.endpoint.replace('https://android.googleapis.com/gcm/send/', ''), note.tag, note.icon, note.broadcast));
                }
                return Promise.all(promises);
            });
        });
    }));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(newSubscription) {
      // TODO: Send to application server
      console.log('[Service Worker] New subscription: ', newSubscription);
    })
  );
});

//Utility function to actually show the notification.
function showNotification(title, body, url, subscriptionId, tag, icon, broadcast) {
    var options = {
        body: body,
        tag: tag,
        icon: config.host + '/subscription/' + subscriptionId + '/notifications/icon/'+icon+'?broadcast=' + broadcast
    }

    console.log(self.registration)

    return self.registration.showNotification(title, options);
}
