const publisher = require('../controllers/publisher.server.controller');
const notifications = require('../controllers/notifications.server.controller');
const subscription = require('../controllers/subscription.server.controller');
const users = require('../../app/controllers/users.server.controller');
const passport = require('passport');

module.exports = function (app) {
          
    app.route('/users')
        .post(users.isAuthenticated, users.create)
        .get(users.isAuthenticated, users.list);

    app.route('/users/:userId')
        .get(users.isAuthenticated, users.read)
        .put(users.isAuthenticated, users.update)
        .delete(users.isAuthenticated, users.delete);

    app.param('userId', users.userById);
};
