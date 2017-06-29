const https = require('https');
const gcmAPI = require('../../config/config').gcmAPI;

exports.send = function (subscriptions, notification, callback) {
    subscriptions = subscriptions || [];
    var post_data = {},
        https_options = {
        hostname: 'fcm.googleapis.com',
        path: '/fcm/send',
        method: 'POST',
        headers: {
            'Authorization': 'key=' + gcmAPI,
            'Content-Type': 'application/json'
        }
    };

    if (subscriptions instanceof Array) {
        post_data.registration_ids = subscriptions;
    } else {
        post_data.to = subscriptions;
    }

    if (subscriptions.length <= 0) {
      return callback('no subscribers to send to GCM');
    }

    if (notification) {
      post_data.data = notification;
      post_data.notification = notification;
    }

    console.log(post_data)

    //Open HTTPS request using https_options
    var post_req = https.request(https_options, function (post_res) {
        post_res.on('data', function (chunk) {
            console.log(chunk.toString())
            callback(null, JSON.parse(chunk.toString()));
        });
    });

    //Write post request data to connection then close connection
    post_req.write(JSON.stringify(post_data));
    post_req.end();
};
