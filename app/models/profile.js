var mongoose = require('mongoose');
    Schema = mongoose.Schema;

    ProfileSchema = new Schema({
        profileUserId:{
        	type: String,
        },
        user: {
           ref: 'User',
           type: String
        },
        bio:{
            type:String,
        
        }, 
        ratings:{
        	type:Number,
        	default:0
        },
        userPreferedTasks:{
             type: String,
        },
        userSkills:[
         {
             type: String,
         }
        ],
        profilePic:{
        	type: String,
        	default: 'default_user_profile_pic.jpg',
        },
        location:
           {
         
           	 lat: String,
           	 long: String
           }
        ,
        createdOn:{
		 	type:Date,
		 	default:Date.now
	    }
    });

    mongoose.model('Profile',ProfileSchema);
    Profile = mongoose.model('Profile');