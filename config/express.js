var config = require('./config'),
    express = require('express'),
    session = require('express-session'),
    mongoDBStore = require('connect-mongodb-session')(session),
    passport = require('passport'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    flash = require('connect-flash');

module.exports = function () {
	var app = express(),
        sessionStore = new mongoDBStore({
            uri: config.db,
            collection: 'user_sessions'
        }); 

	switch (process.env.NODE_ENV) {
		case 'production':
		    app.use(compress());
		    break;
		default:
		    app.use(morgan('dev'));
		    break;
	}

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        store: sessionStore
    }));

    app.set('views','./app/views');
    app.set('view engine', 'ejs');
    
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

	require('../app/routes/index.server.routes')(app);
	require('../app/routes/subscription.server.routes')(app);
	
	require('../app/routes/users.server.routes')(app);
	require('../app/routes/notifications.server.routes')(app);
	require('../app/routes/publisher.server.routes')(app);
    
    app.use(express.static('./public'));

    //The 404 Route (ALWAYS Keep this as the last route)
    app.get('*', function(req, res){
      res.send('what???', 404);
    });

	return app;
}