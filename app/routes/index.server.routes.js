const index = require('../controllers/index.server.controller');
const notifications = require('../controllers/notifications.server.controller');
const subscription = require('../controllers/subscription.server.controller');
const users = require('../../app/controllers/users.server.controller');
const passport = require('passport');

module.exports = function (app) {
	app.get('/', index.render);
	app.get('/firebase', function(req, res){
		res.render('firebase');
	});

	//Rend main publisher page
  app.route('/dashboard')
     .get(users.isAuthenticated,
          notifications.allNotifications,
          subscription.allSubscribers,
          index.renderPublish);

  app.route('/signup')
     .get(users.renderSignup)
     .post(users.create)

  app.route('/signin')
     .get(users.renderSignin)
     .post(passport.authenticate('local', {
       successRedirect: '/dashboard',
       failureRedirect: '/signin',
       failureFlash: true
     }));

  app.route('/signout')
     .get(users.isAuthenticated, users.signout);
};
