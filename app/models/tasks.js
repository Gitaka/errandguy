var mongoose = require('mongoose');
    Schema = mongoose.Schema;

var TaskSchema = new Schema({
	userId:{
		type:String,
	},
	task_name:{
		type: String
	},
	task_location: {
       type:  String 
	},
	task_description: {
	   type: String
	},
	task_cost: {
		type: Number
	},
	task_status:{
       type: Number,
	},
	tasker :{
		type:String,
		default:'null',
	},
	category:{
		type:String,
		
	},
	invoiced:{
		type:Number,
	},
    confirmed:{
    	type:Number,
    },
	createdOn:{
	 	type:Date,
	 	default:Date.now
	  }
});

mongoose.model('Task',TaskSchema);
var Task = mongoose.model('Task');