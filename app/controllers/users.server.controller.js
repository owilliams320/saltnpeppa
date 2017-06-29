/*
**
** User controller to manage CRUD operations for user operations
**
*/

var User = require('mongoose').model('User');
var getErrorMessage = function (err) {
    var message = '';

    if (err.code) {
        switch (err.code) {
            case 11001:
            case 11000:
                message = 'Username already exists';
            break;
            default:
                message = 'Something went wrong ;(';
        }
    } else {
        for (var errMsg in err.errors) {
            if (err.errors[errMsg]) {
                message = err.errors[errMsg];
            }
        }
    }
    return message;
}

exports.renderSignup = function (req, res) {
    var flashMessage = req.flash('error') || req.flash('info');

    res.status(200).render('signup', {
       messages: flashMessage
    });
};

exports.renderSignin = function (req, res) {
    var flashMessage = req.flash('error') || req.flash('info');

    res.status(200).render('signin', {
       messages: flashMessage
    });
};

exports.create = function (req, res, next) {
    var user = new User(req.body);

    user.save(function (err) {
        if (err) {
            var message = getErrorMessage(err);
            req.flash('error', message);
            return res.redirect('/signup');
        } else {
            res.redirect('/dashboard');
        }
    });
};

exports.list = function (req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            var message = getErrorMessage(err);
            req.flash('error', message);
            return res.redirect('/signup');
        } else {
            res.json(users);
        }
    });
};

exports.read = function (req, res) {
    res.json(req.user);
};

exports.update = function (req, res, next) {
    User.findByIdAndUpdate(req.user.id, req.body, function (err, user) {
        if (err) {
            var message = getErrorMessage(err);
            req.flash('error', message);
            return res.redirect('/publisher');
        } else {
            res.json(user);
        }
    });
};

exports.delete = function (req, res, next) {
    req.user.remove(function(err) {
        if (err) {
            var message = getErrorMessage(err);
            req.flash('error', message);
            return res.redirect('/publisher');
        } else {
            res.json(req.user);
        }
    });
};

exports.signout = function (req, res, next) {
    req.logout();
    res.redirect('/');
};

exports.dashboard = function (req, res, next) {
    res.status(200).render('dashboard');
};

exports.isAuthenticated = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).redirect('/signin');
    }
};

exports.userById = function (req, res, next, id) {
    User.findOne({'_id': id}, function (err, user) {
        if (err) {
            var message = getErrorMessage(err);
            req.flash('error', message);
            return res.redirect('/signin');
        } else {
            req.user = user;
            next();
        }
    });
};
