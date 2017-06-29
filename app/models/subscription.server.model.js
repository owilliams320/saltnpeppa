var mongoose = require('mongoose'),
    Schema = require('mongoose').Schema;

var subscriptionSchema = new Schema({
	subscriptionId: {
		type: String,
        required: true
    },
	created: {type: Date},
    updated: {type: Date},
    notifications: Array
});

subscriptionSchema.statics.cleanGCMSubcriberList = function (subcriptions, results, next) {
    var potentialRecipients = subcriptions;
    var broadcastResults = results;
    var bulk = this.collection.initializeOrderedBulkOp();
    var bulkOpCnt = 0;

    for (i in potentialRecipients) {
        var potentialRecipient = potentialRecipients[i];
        var resultStatus = broadcastResults[i];
        
        if (resultStatus['error'] === 'NotRegistered') {
            bulk.find({'subscriptionId': potentialRecipient}).remove();
            bulkOpCnt++;
        } else if (resultStatus['registration_id']) {
            bulk.find({'subscriptionId': potentialRecipient}).update({'subscriptionId': resultStatus['registration_id']});
            bulkOpCnt++;
        }
    }

    if (bulkOpCnt > 0) {
        bulk.execute(function (err, data) {
            if (err) { return next(err); } 
            next(null, data);
        });
    } else {
        next(null, {message:"NO clean up needed"});
    }
};

subscriptionSchema.pre('save', function(next){
    this.updated = new Date();
    if (!this.created) {
        this.created = this.updated;
    }
    next();
});

mongoose.model('subscription', subscriptionSchema);
 