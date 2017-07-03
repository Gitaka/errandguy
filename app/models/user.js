var mongoose =require('mongoose');
    Schema = mongoose.Schema;

    var UserSchema = new Schema({
    	name:{
    	    type: String,
	
    	},
    	password:{
         	 type:String,
	 	     validate:[
			 	  function(password){
			 	  	return password && password.length>4;
			 	  },'password should be more than 6 characters'
	 	   ]
    	},
    	email:{
    		type: String,
			unique: true,
			match:[/.+\@.+\..+/,"Please fill a valid email address"]

    	},
        accountNo:{
            type: Number,
        },
        accountName:{
            type: String,
        },
        location:{
            type:String,
        },
        phoneNo:{
           type:String,
           unique:true,
        },
        ratings:{
            type:Number,
            default:1
        },
        token:{
          type:String,
        },

    	 createdOn:{
	 	       type:Date,
	 	       default:Date.now
        }
	    
    });

    mongoose.model('User',UserSchema);
    var User = mongoose.model('User'); 