var mongoose = require('mongoose'); 
    Task = mongoose.model('Task');
    User = mongoose.model('User');
    Bid = mongoose.model('Bid');
    Account = mongoose.model('Account');
    Invoice = mongoose.model('Invoice');


exports.createTask = function(req,res,next){
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
                var newTask = new Task({
                         userId : user._id,
                         task_name : req.body.task_name,
                         task_location : req.body.location,
                         task_description : req.body.desc,
                         task_cost : req.body.cost,
                         task_status : 0,
                         invoiced : 0,
                         confirmed : 0,
                       });

                var balancePromise = Account.findOne({userId:user._id,accountNo:user.accountNo}).exec();
                    balancePromise.then(function(balance){
                        if(req.body.cost > balance.tempAmount){
                              res.json({
                               error:false,
                               message:'Please Top Up Account.Your Balance is:' + balance.tempAmount,
                               
                              });
                         }else{
                               //post challenge while same time reducing tempAmount By cost of task;
                               var taskPromise = newTask.save();

                                taskPromise.then(function(task){
                                  console.log('task successfully created');
                                  res.json({
                                    error:false,
                                    message:'Task Created Successfully',
                                  });
                                })
                                 .catch(function(err){
                                    console.log('Task no created' + err);
                                    res.json({
                                      error:true,
                                      message:'Failed to create task',
                                    });
                                 });
                               
                           }
                         return balance;
                     })
                     .then(function(balance){
                        if(req.body.cost > balance.tempAmount){
                            return balance;
        
                           }else{
                               balance.tempAmount = balance.tempAmount - req.body.cost;
                               return balance.save();
                            }

                     })
                     .catch(function(err){
                        console.log(err);
                         res.json({
                             error:err,
                           })
                      });
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}


exports.getTasks = function(req,res,next){
   var promise = Task.find({task_status:0}).sort([['_id',-1]]).exec();  
       
       promise.then(function(task){
           res.json({
           	 error:false,
           	 message:'returning all tasks',
           	 data:task,
           });
       }).catch(function(err){
       	  console.log('error:' + err);
       	  res.json({
       	  	error: true,
       	  	message:'error occured' + err,
       	  });
       });

}
exports.myTasks = function(req,res,next){
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
                  promise = Task.find({userId:user._id}).sort([['_id',-1]]).exec();

                  promise.then(function(challenges){
                      res.json({
                        error:false,
                        message:'Tasks found',
                        data:challenges,
                      });
                  })
                  .catch(function(err){
                      console.log('err');
                      res.json({
                        error:true,
                        message:'error occured,could not retrive any tasks',

                      });
                  });
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}
exports.requestTask = function(req,res,next){
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
                  var task_id = req.body.task_id;
                  var promise = Task.findById(task_id).exec();
                      promise.then(function(task){
                          //console.log(task.userId);
                          if(task.userId == user._id){
                              res.json({
                                error:true,
                                message:"Cannot Bid,Your Own Task",

                              });
                              return task;
                          }else{

                              if(task.task_status == 1){
                                    res.json({
                                       error: true,
                                       data:task.userId,
                                       message:'Task has already been assigned',
                                    });
                                
                              }else if(task.task_status == 0){
                                        
                                       var task_name = task.task_name;

                                       newBid = new Bid({
                                        bidder : user._id,

                                        task_id : req.body.task_id,
                                        user:user._id,
                                       });
                                      
                                       bidPromise = newBid.save();

                                       bidPromise.then(function(bid){
                                            res.json({
                                               error: false,
                                               message:'Request to perform task: ' + task_name + 'has been received.',
                                           });
                                            return bid;
                                          }).catch(function(err){
                                            console.log('task_request err ' + err);
                                              res.json({
                                               error: true,
                                               message:'Bid Request not eccepted',
                                              });
                                          });

                              }//end of checking if task status is 0
                          }//end of checking if its my bid,
                          return task;
                      })
                      .catch(function(err){
                        console.log('task_request err ' + err);
                          res.json({
                           error: true,
                           message:'Task not found'+err,
                          });
                      });

           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);

}


exports.confirm = function(req,res,next){
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
                var task = req.body.task;
                    tasker = req.body.tasker;

                    promise = Task.findById(task).exec();

                    promise.then(function(task){
                      task.task_status = 1;
                      task.tasker = tasker;

                      return task.save();
                    })
                     .then(function(task){
                        res.json({
                          error:false,
                          message: "Tasker confirmed",
                          data:task,
                        });
                     })
                     .catch(function(err){
                      console.log(err);
                      res.json({
                        error: true,
                        message: 'tasker not confirmed',
                      });
                     });
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}

exports.tasksAmIn = function(req,res,next){
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
                 var promise = Task.find({tasker:user._id}).sort([['_id',-1]]).exec();  
                     
                     promise.then(function(task){
                         res.json({
                           error:false,
                           message:'returning all tasks',
                           data:task,
                         });
                     }).catch(function(err){
                        console.log('error:' + err);
                        res.json({
                          error: true,
                          message:'error occured' + err,
                        });
                     });

           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}

exports.invoice = function(req,res,next){
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
             
               var task = req.param('task');
               var promise = Task.findOne({_id:task}).exec();  
                     
                     promise.then(function(task){
                         task.invoiced = 1;
                         return task.save();
                     })
                     .then(function(task){

                         newInvoice = new Invoice({
                              task_owner : task.userId,
                              task_id : task._id,
                              tasker : task.tasker,
                              amount : task.task_cost,
                              dueDate : "3/27/2017",
                           });
                                      
                          invoicePromise = newInvoice.save();

                          invoicePromise.then(function(invoice){
                                  res.json({
                                     error: false,
                                     message:'Client has been invoiced',
                                     data: invoice,
                                     task:task,
                                  });
                                
                            });

                     })
                     .catch(function(err){
                        console.log('error:' + err);
                        res.json({
                          error: true,
                          message:'error occured' + err,
                        });
                     });
                   
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}

exports.viewInvoices = function(req,res,next){
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
             var promise = Invoice.find({task_owner:user._id}).sort([['_id',-1]]).exec();
                 promise.then(function(invoice){
                     res.json({
                        error:false,
                        data:invoice,
                     });
                 })
                  .catch(function(err){
                        console.log('error:' + err);
                        res.json({
                          error: true,
                          message:'error occured' + err,
                        });
                     });
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);
}

exports.confirmTask = function(req,res,next){
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
               var task = req.param('task');

                   var promise = Task.findOne({_id:task}).exec();  
                     
                     promise.then(function(task){
                         task.confirmed = 1;
                         return task.save();
                     })
                     .then(function(task){
                        //update everyones accounts
                        //invoice updated to cleared
                        if(user._id == task.userId){
                            var promise = Account.findOne({accountNo:user.accountNo}).exec();
                                promise.then(function(account){
                                    account.amount = account.amount - task.task_cost;
                                     return account.save();
                                    
                                 });
                        }
                         return task;
                     })
                     .then(function(task){
                            var promise = Account.findOne({userId:task.tasker}).exec();
                                promise.then(function(account){
                                    account.amount = account.amount + task.task_cost;
                                    account.tempAmount = account.tempAmount + task.task_cost;
                                     return account.save();
                                    
                                 });   
                          return task;                    
                     })
                     .then(function(task){

                          var promise = Invoice.findOne({task_id:task._id}).exec();
                            promise.then(function(invoice){
                              invoice.status = "Cleared";
                              return invoice.save();

                            })
                            .then(function(invoice){
                                    res.json({
                                        error:false,
                                        message:'Invoice Cleared,Account Credited',
                                    });
                            });
                     })
                     .catch(function(err){
                        console.log('error:' + err);
                        res.json({
                          error: true,
                          message:'error occured' + err,
                        });
                     });

           }
         
       };

      ifAuthenticated(handleAuthenticationRequest,req.token);
}

exports.getTaskRequests = function(req,res,next){
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
             var taskId = req.body.taskId;
             var promise = Bid.find({task_id:taskId}).populate({path: 'bidder',model: 'User'}).exec();
                 promise.then(function(bid){

                            res.send({
                                'error':false,
                                'message':'return',
                                'data':bid,
                              });
                 })
                 .catch(function(err){
                    res.send({
                      'error':true,
                      'message':'cannot get bids' + err,
                    });
                 });
           }
         };
  ifAuthenticated(handleAuthenticationRequest,req.token);
};

exports.invoiceNotification = function(req,res,next){
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
              var taskId = req.body.taskId;
                  taskOwner = req.body.taskOwner;
                  tasker = req.body.tasker;
                  amount = req.body.amount;
                  taskName = req.body.taskName;
                  dueDate = req.body.dueDate;
                
                 var promise = User.findById(taskOwner).exec();

                  promise.then(function(user){
                     var userPhoneNo = user.phoneNo;
                         username = user.name;
                         
                         taskerpromise = User.findById(tasker).exec();
                         taskerpromise.then(function(taskerInfo){
                            var taskerName = taskerInfo.name;
                             
                             res.send({
                               "error":false,
                               "userPhoneNo":userPhoneNo,
                               "message":"Hey"+" "+username+" "+"Received Invoice For:" +" "+ taskName +" "+ "From"+" "+taskerName+" "+ "Of amount"+" "+ amount+" "+"Due On"+" "+dueDate+".",
                             });

                         });
                     

                    return user;
                  })
                  .catch(function(err){
                      console.log(err + "user not found matching that id");
                  });
           }
         }
  ifAuthenticated(handleAuthenticationRequest,req.token);
};