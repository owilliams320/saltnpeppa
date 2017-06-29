exports.render = function (req, res) {
    res.render('index', {title:'Web Push Notifications'});
};

//send clean list after
exports.renderPublish = function (req, res) {
    var flashMessages = req.flash('error') || req.flash('info')
        notifications = req.notifications || [],
        subscribers = req.subscribers || [];

    res.render('dashboard', {
        messages: flashMessages,
        notifications: notifications,
        subscribers: subscribers
    });
};
