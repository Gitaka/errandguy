var mongoose = require('mongoose');
    Schema = mongoose.Schema;


var SmSCodeSchema = new Schema({
     userId:{
     	type:String,
     },
     code:{
     	type:String,
     	unique:true,
     },
     status:{
     	type:Number,
     },
     createdOn:{
	 	       type:Date,
	 	       default:Date.now
	    }
});

mongoose.model('SmSCode',SmSCodeSchema);

var SmSCode = mongoose.model('SmSCode');