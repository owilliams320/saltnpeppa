const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

var notificationsSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
	endpoint: {
    type: String,
    required: true,
	},
	icon: String,
	tag: String,
  broadcasts: Array,
	created: {
    type: Date,
    default: Date.now
  }
});


mongoose.model('notifications', notificationsSchema);
