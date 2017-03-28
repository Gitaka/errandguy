var mongoose = require('mongoose');
    User = mongoose.model('User');
    mongoose.Promise = require('bluebird');
    SmSCode = require('mongoose').model('SmSCode');
    jwt = require('jsonwebtoken');
    http = require('http');
    https = require('https');
    querystring = require('querystring');
    request = require('request');
    fs = require('fs');
    bcrypt = require('bcrypt-nodejs');
    Account = mongoose.model('Account');
    Transaction = mongoose.model('Transaction');

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
        
        promise = SmSCode.findOne({code:otp}).exec();

        promise.then(function(code){
          code.status = 1;

          return code.save();
        })
        .then(function(code){
              var userId = code.userId;
               
              var promise = User.findById(userId).exec();
                 
                 promise.then(function(user){
                      res.json({
                        "error":false,
                        "message": "User created successfully",
                        "data": user,
                       });
                   return user;
                 })
                 .then(function(user){
                    var account = new Account({
                       userId : user._id,
                       accountNo : user.accountNo,
                       accountName : user.accountName,
                       amount :0,
                       tempAmount :0,
                    });

                    var accountPromise = account.save();
                        accountPromise.then(function(account){
                          //do something with the account
                          console.log('Account created');
                          console.log(account);
                        })
                        .catch(function(err){
                          console.log('error: account not created' + err);
                        });
                 })
                 .catch(function(err){
                    console.log(err);
                 });

                 return code;
        })
         .catch(function(err){
              res.json({
                  "error": true,
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

exports.getAccount = function(req,res,next){

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
                 //user is authenticated
                 //check users account
                  var promise = Account.findOne({accountNo:user.accountNo}).exec();

                      promise.then(function(account){
                         res.json({
                            error:false,
                            message:"Account Number",
                            data:account,
                         });
                      })
                      .catch(function(err){
                        res.json({
                          error:true,
                          message:'error occured,account not found' + err,
                        });
                      });
         
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}

exports.debitAccount = function(req,res,next){
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
              var amount = req.param('amount');
              var accountPromise = Account.findOne({accountNo:user.accountNo}).exec();
                  accountPromise.then(function(account){
                    if(account){
                       
                      //do something,make a post request to africa is talking api c2b mobile checkout
                     var result = checkoutUser(user.PhoneNo,amount,user.accountNo,user.accountName);
 
                      //create a transaction
                  
                      var transaction = new Transaction({
                          userId : user._id,
                          accountNo : account.accountNo,
                          accountName : account.accountName,
                          transactionFee : amount,
                          transactionId : result.data.transactionId,
                          status : result.data.status,

                      });

                      var transactionPromise = transaction.save();
                          transactionPromise.then(function(transaction){
                            //transaction was created,now update the accounts table to reflect new balance

                            var promise = Account.findOne({accountNo:transaction.accountNo}).exec();
                                promise.then(function(account){
                                  account.amount = account.amount + transaction.transactionFee;
                                  account.tempAmount = account.tempAmount + transaction.transactionFee;//account.amount; 

                                  return account.save();
                                })
                                .then(function(account){
                                   res.json({
                                     "error":false,
                                     "message":"Your Account was debited successfully",
                                     "data":{
                                        "account":account,
                                        "transaction":transaction,
                                     }
                                   });
                                })
                                .catch(function(err){
                                  console.log(err);
                                  res.json({
                                    "error":true,
                                    "message":"error occured,account not found" + err,
                                  });
                                });
 
                             return transaction;
                          }) 
                          .catch(function(err){
                             console.log('error encountered during transaction insert');
                          });

                    }
                 })
                 .catch(function(err){
                    res.json({
                        type: false,
                        data: 'Error occured',
                    });
                 });



              ////end of debiting account


           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}


exports.getTransactionsHistory = function(req,res,next){
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
                var promise = Transaction.find({userId:user._id}).sort([['_id',-1]]).exec();

                    promise.then(function(transactions){
                       res.json({
                          error:false,
                          message:'Returning Transactions for' + transactions.accountNo,
                          data:transactions,
                       });
                    })
                    .catch(function(err){
                        console.log(err);

                        res.json({
                            error:true,
                            message:'error occured' + err,
                        });
                     });
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}


ifAuthenticated = function(callBack,token){
        var promise = User.findOne({token:token}).exec();

        promise.then(function(user){

           callBack(null,user);
            
        })
        .catch(function(err){
            console.log(err + "user not found matching that token");
        });
}
createNewUser = function(name,email,password,location,phoneNo){
            var accountNo = randomIntInc(100000,9999999999);

            var newUser = new User({
                  name     : name,
                  email    : email,
                  password : password,
                  location : location,
                  phoneNo  : phoneNo,
                  accountNo : accountNo,
                  accountName : name,
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



checkoutUser = function(phoneNo,amount,accountNo,accountName){

      var username = 'gitakaMuchai';
      var apikey = '0967735d32b57fc6c9c0b643d8355b3128e7b4bc9be23f6de3d3a521d127470f';

      var post_data = querystring.stringify({
          'username' : username,
          'accountNo' : accountNo,
          'phoneNumber' : phoneNo,
          'currencyCode' : 'KES',
          'amount' : amount,
          'metadata': {
             "accountNo" : accountNo,
             "accountName" : accountName,
          }
      });

      var post_options = {
           host   : 'api.africastalking.com',
           path   : '/payment/mobile/checkout/request',
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

        /*var post_req = https.request(post_options,function(res){
          res.setEncoding('utf8');
          res.on('data',function(data){
           
          if(data.status == 'PendingConfirmation'){

            var result = {
               "error":false,
               "message":"Request Successfull",
               "data":data,
            };
            return result;

          }else{
             var result = {
               "error":true,
               "message":"Request UnSuccessfull",
               "data":data,
            };
            return result;
          }

        });
    });

    post_req.write(post_data);
    post_req.end();*/
          var data = {
            "status": "PendingConfirmation",
            "description": "Waiting for user input",
            "transactionId": "ATPid_SampleTxnId123"
          }

          var result = {
               "error":false,
               "message":"Request Successfull",
               "data":data,
            };
            return result;
}
















































































