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
                         task.confirmed = 0;
                         return task.save();
                     })
                     .then(function(task){
                        //update everyones accounts

                       res.json({
                        data:task,
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