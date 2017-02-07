var mongoose = require('mongoose');
    User = mongoose.model('User');
    SMSCode = mongoose.model('SmSCode');
    mongoose.Promise = require('bluebird');
    SmSCode = require('mongoose').model('SmSCode');
    jwt = require('jsonwebtoken');
    http = require('http');
    https = require('https');
    querystring = require('querystring');
    request = require('request');
    fs = require('fs');
    bcrypt = require('bcrypt-nodejs');

//africa is talking credentials
var username = 'gitakaMuchai';
var apikey = '0967735d32b57fc6c9c0b643d8355b3128e7b4bc9be23f6de3d3a521d127470f';


//User.findOne({email:req.body.email,password:req.body.password}
exports.register = function(req,res,next){
        var promise = User.findOne({email:req.body.email,password:req.body.password}).exec();

        promise.then(function(user){
            if(user){
                res.json({
                    type: false,
                    data: "User already exists",
                    token: user.token
                });
            }else{

                var name = req.body.name;
                    email = req.body.email;
                    password = req.body.password;
                    location = req.body.location;
                    phoneNo  = req.body.phoneNo;


                 
                 var info = createNewUser(name,email,password,location,phoneNo);
                 res.json({
                        name:name,
                        email:email,
                        password:password,
                        location:location,
                        phoneNo:phoneNo,
                        info:info,
                    });

                 return user;
 
            }
        })
         .catch(function(err){
            res.json({
                type: false,
                data: 'Error occured',
            });
         });

}



exports.auth = function(req,res,next){
  var promise = User.findOne({email:req.body.email,password:req.body.password}).exec();

      promise.then(function(user){
             if(!user){
                 res.json({
                 type:false,
                 data:"Authentication Failure User not found" ,
                });
              }else{ 
                    res.json({
                        type:true,
                        message:'user loggedIn successfully',
                        data:user,
                        token:user.token
                    });
              }
            return user;
      })
      .catch(function(err){
        res.json({
            type:false,
            data:"Error Occured" + err,
        });
      });

}

exports.authOtp = function(req,res,next){
    
    var otp = req.body.otp;
        
        promise = SMSCode.findOne({code:otp}).exec();

        promise.then(function(code){
          code.status = 1;

          return code.save();
        })
        .then(function(code){
              var userId = code.userId;
               
              var promise = User.findById(userId).exec();
                 
                 promise.then(function(user){
                      res.json({
                        "error":true,
                        "message": "User created successfully",
                        "data": user,
                       });
                   return user;
                 })
                 .catch(function(err){
                    console.log(err);
                 });

                 return code;
        })
         .catch(function(err){
              res.json({
                  "error": false,
                  "message": "User not verified." + err,
              });
        });

}

exports.user = function(req,res,next){
       var promise = User.find({token:req.token}).exec();

        promise.then(function(user){
            res.json({
              type:true,
              data:user
           });
            //return user;
        })
        .catch(function(err){
            console.log(err + "user not found matching that token");
        });
}

createNewUser = function(name,email,password,location,phoneNo){
            var newUser = new User({
                  name     : name,
                  email    : email,
                  password : password,
                  location : location,
                  phoneNo  : phoneNo,
               });

            var newUserPromise = newUser.save();
                  newUserPromise.then(function(user){
                     user.token = jwt.sign(user,process.env.JWT_SECRET);
                     return user.save();
                  })
                  .then(function(user){
                    var otp = randomIntInc(100000,999999);
                    var userId = user._id;

                    createOneTimePassword(userId,phoneNo,otp);
                    console.log("creating a one time password and saving the sms code to db");
                    return user;
                   
                  })
                  .catch(function(err){
                    //catch any error
                    console.log('error occurd ' + err);
                  });

            var res = {
               "error":true,
               "message":"User creates and SMS request is initiated! You will be receiving it shortly",
            };
            return res;
}

createOneTimePassword = function(userId,mobile,otp){

        var smsCodes = new SmSCode({
                 userId : userId,
                 code : otp,
                 status : 0,
             });
          
          var smsCodePromise = smsCodes.save();
              smsCodePromise.then(function(codes){
                  
              //sendMessage(mobile,otp);
              console.log("sending sms verification code");

                return codes;
              })
              .catch(function(err){
                console.log('error encountered during smscodes insert');
              });




}


randomIntInc = function(low,high){
    return Math.floor(Math.random() * (high - low + 1) + low);
};

sendMessage = function(mobile,otp){
    var to  = mobile;
    var message = otp +"  " + "is your errandGuy Verfication Code";
    
    var post_data = querystring.stringify({
        'username' : username,
        'to' : to,
        'message' : message
    });

    var post_options = {
         host   : 'api.africastalking.com',
         path   : '/version1/messaging',
         method : 'POST',
        
         rejectUnauthorized : false,
         requestCert        : true,
         agent              : false,

         headers : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'Accept': 'application/json',
            'apikey': apikey
        }
    };


    var post_req = https.request(post_options,function(res){
        res.setEncoding('utf8');
        res.on('data',function(chunk){
            var jsObject = JSON.parse(chunk);
            var recipients = jsObject.SMSMessageData.Recipients;

            if(recipients.length > 0){
                for (var i = 0; i < recipients.length; ++i ) {
                            var logStr  = 'number=' + recipients[i].number;
                            logStr     += ';cost='   + recipients[i].cost;
                            logStr     += ';status=' + recipients[i].status; // status is either "Success" or "error message"
                            console.log(logStr);
                    }
            }else {
                 console.log('Error while sending: ' + jsObject.SMSMessageData.Message);
            }
        });
    });

    post_req.write(post_data);
    post_req.end();
}


















































































