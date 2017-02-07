var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var BidSchema = new Schema({
	request_from : {
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