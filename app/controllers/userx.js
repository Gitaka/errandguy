var User = require('mongoose').model('User');
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



exports.register = function(req,res,next){

    User.findOne({email:req.body.email,password:req.body.password},function(err,user){
        if(err){
            res.json({
                type:false,
                data:"Error Occured:" + err
            });
        }else{
            if(user){
                res.json({
                    type:false,
                    data:"User Already Exists",
                    token:user.token
                });
            }else{
                   
                
                   var userModel = new User();

                   userModel.name = req.body.name;
                   userModel.email = req.body.email;
                   userModel.password = req.body.password;
                   userModel.location = req.body.location;
                   userModel.phoneNo = req.body.phoneNo;


                   userModel.save(function(err,user){
  
                     user.token = jwt.sign(user,process.env.JWT_SECRET);
                     user.save(function(err,user1){

                        var otp = randomIntInc(100000,999999);


                         var smsCodeModel = new SmSCode();
          
                             smsCodeModel.userId = user._id;
                             smsCodeModel.code = otp;
                             smsCodeModel.status = 0;

                             smsCodeModel.save(function(err,otpCode){
                                if(err){
                                    res.send({
                                        type:false,
                                        message:'Failed to create Otp code',
                                    });
                                }else{
                                   smsVery = sendSmSVerificationCode(user1.phoneNo,otp)
                                   //sendMessage(user1.phoneNo,otp);

                                    res.send({
                                        type:true,
                                        message:'successfully created otp code',
                                        otp:otp,
                                        smsVery:smsVery,
                                        data:user1,
                                        token:user1.token
                                    });
                                }
                             });

                        //createOneTimePassword(user._id,otp);

                        /*res.json({
                            type:true,
                            otp:otp,
                            smsVery:'smsVery',
                            data:user1,
                            token:user1.token
                        });*/

                     });
                   });
             
            }
        }
    });
}



exports.auth = function(req,res,next){
  User.findOne({email:req.body.email,password:req.body.password},function(err,user){
     if(err){
        res.json({
            type:false,
            data:"Error Occured" + err,
        });
     }
     if(!user){
         res.json({
            type:false,
            data:"Authentication Failure User not found" ,
        });
     }
    
        if(user){ 
                res.json({
                    type:true,
                    message:'user loggedIn successfully',
                    data:user,
                    token:user.token
                });
     
        }
     
  });
}

exports.user = function(req,res,next){
    User.findOne({token:req.token},function(err,user){
        if(err){
            res.json({
                type:false,
                data:"Error Occured" + err,
            });
        }else{
            res.json({
              type:true,
              data:user
           });
        }
    });
}


createOneTimePassword = function(userId,otp){
     var smsCodeModel = new SmSCode();
          
         smsCodeModel.userId = userId;
         smsCodeModel.code = otp;
         smsCodeModel.status = 0;

         smsCodeModel.save(function(err,otpCode){
            if(err){
                res.send({
                    type:false,
                    message:'Failed to create Otp code',
                });
            }else{

                sendSmSVerificationCode(mobile,otp);

                res.send({
                    type:true,
                    message:'successfully created otp code',
                    data:otpCode.code
                });
            }
         });
}

sendSmSVerificationCode = function(mobile,otp){
    var message = mobile + otp + 'message sent successfully';
    return message;
}

randomIntInc = function(low,high){
    return Math.floor(Math.random() * (high - low + 1) + low);
};

sendMessage = function(mobile,otp){
    var to  = mobile;
    var message = otp + "is your errandGuy Verfication Code";
    
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



















































































