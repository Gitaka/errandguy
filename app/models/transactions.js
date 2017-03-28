var mongoose = require('mongoose');
    Schema = mongoose.Schema;


var TransactionSchema = new Schema({
    userId:{
    	type: String,
    },
    accountNo:{
    	type : Number,
    },
    accountName:{
    	type: String,
    },
    transactionFee: {
    	type: Number,
    },
    transactionId: {
        type: String,
    },
    source: {
    	type: String,
    },
    status: {
    	type: String,
    },
	createdOn:{
	 	type:Date,
	 	default:Date.now
	  }

});

mongoose.model('Transaction',TransactionSchema);
var Transaction = mongoose.model('Transaction');