var notifications = require('../../app/controllers/notifications.server.controller');
var users = require('../../app/controllers/users.server.controller');

module.exports = function (app) {
    app.route('/notifications')
       .post(notifications.create)
       .get(notifications.list);
    
    app.route('/notifications/:notificationId')
       .get(notifications.read)
       .put(users.isAuthenticated, notifications.update)
       .delete(users.isAuthenticated, notifications.delete);

    app.param('notificationId', notifications.notificationById);
};