var mongoose = require('mongoose');
    Schema = mongoose.Schema;


var AccountSchema = new Schema({
  	userId:{
		type:String,
	},
	accountNo:{
       type: Number,
	},
	accountName: {
		type: String,
	},
	amount: {
		type: Number,
	},
	tempAmount: {
		type: Number,
	},
    createdOn:{
	 	type:Date,
	 	default:Date.now
	  }
});

mongoose.model('Account',AccountSchema);
var Account = mongoose.model('Account');