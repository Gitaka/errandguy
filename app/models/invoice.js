var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var InvoiceSchema = new Schema({
    task_owner:{
    	type: String,
    },
	task_id: {
		ref: 'Task',
		type: String,
	},
	tasker:{
		ref: 'User',
		type: String,
	},
	amount:{
		type: Number,
	},
	dueDate:{
		type : String,
	},
	status: {
		type : String,
		default: 'Pending',
	},
    createdOn:{
	 	type:Date,
	 	default:Date.now
	  }
});

mongoose.model('Invoice',InvoiceSchema);
var Invoice = mongoose.model('Invoice');