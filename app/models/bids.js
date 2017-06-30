var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var BidSchema = new Schema({
	bidder : {
		ref: 'User',
		type : String
	},
	task_id: {
		type: String
	},
 
    createdOn:{
	 	type:Date,
	 	default:Date.now
	  }
});

mongoose.model('Bid',BidSchema);
var Bid = mongoose.model('Bid');