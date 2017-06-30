var mongoose = require('mongoose');
    User = mongoose.model('User');
    Profile = mongoose.model('Profile');
    mongoose.Promise = require('bluebird');
    request = require('request');
    fs = require('fs');
    multer = require('multer');


var baseDir = __dirname.substring(0,__dirname.length - 11)+'public'+"\\"+'uploads'; 


exports.getJoinUserProfile = function(req,res,next){
  var user = req.body.userId;

  var promise = Profile.findOne({profileUserId:user}).exec();
      promise.then(function(userProfile){
           res.send({
              "error":false,
              "message":"Returning user profile",
              "data": userProfile
            });
        })
        .catch(function(err){
             res.send({
                "error":true,
                "message":"Failed to get user profile"+" "+ err,
             });
        });
         
                    
};

exports.getUserProfile = function(req,res,next){
       function handleAuthenticationRequest(err,user){
           if(err){
             console.log(err);
             return;
           }else if(user == null){
               res.json({
                  error:true,
                  message:"User Not Found",
               });
              return;  
           }else{
                var promise = Profile.findOne({profileUserId:user._id}).exec();
                    promise.then(function(userProfile){
                       res.send({
                         "error":false,
                         "message":"Returning user profile",
                         "data": userProfile
                       });
                    })
                    .catch(function(err){
                        res.send({
                            "error":true,
                            "message":"Failed to get user profile"+" "+ err,
                        });
                    });
           }
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
};
exports.setUserProfile = function(req,res,next){
        function handleAuthenticationRequest(err,user){
           if(err){
             console.log(err);
             return;
           }else if(user == null){
               res.json({
                  error:true,
                  message:"User Not Found",
               });
              return;  
           }else{
                var storage = multer.diskStorage({
                  destination: function (req, file, cb) {
                    cb(null,baseDir)
                  },
                  filename: function (req, file, cb) {
                    cb(null, file.fieldname + '-'+Date.now()+'-'+ file.originalname)
                  }
                })

                var upload = multer({storage: storage}).single('imgUploader');
                    upload(req,res,function(err){
                        if(err){
                            return res.send({
                                'message':'something went wrong',
                                'err':err,

                            });
                        }
                        var imageFile = req.file;
                        var profileFilename = imageFile.filename;


                        var userId = user._id;
                        console.log(user._id);
                        var locationObj = {
                                     "lat":req.body.lat,
                                     "long":req.body.long,
                                 };

                        var  profile = new Profile({
                                 profileUserId : userId,
                                 ratings :'1',
                                 userPreferedTasks: req.body.preferedTasks,
                                 userSkills: req.body.userSkills,
                                 profiePic : profileFilename,
                                 location : locationObj,                 
                        });

                        var profilePromise = profile.save();
                            profilePromise.then(function(profile){
                              res.send({
                                "error":false,
                                "data":profile,
                                "id":user.name,
                              });
                            })
                            .catch(function(err){
                                res.send({
                                    'data':skillsArray,
                                    "error":"true",
                                    "message":err
                                });
                            });

                        //end of saving user profile;
                    });



           };
         };
      
        ifAuthenticated(handleAuthenticationRequest,req.token);
};

ifAuthenticated = function(callBack,token){
        var promise = User.findOne({token:token}).exec();

        promise.then(function(user){

           callBack(null,user);
            
        })
        .catch(function(err){
            console.log(err + "user not found matching that token");
        });
}