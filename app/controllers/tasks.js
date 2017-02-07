var mongoose = require('mongoose'); 
    Task = mongoose.model('Task');
    User = mongoose.model('User');
    Bid = mongoose.model('Bid');


exports.createTask = function(req,res,next){
   var id = req.body.id;
   var promise = User.findById(id).exec();

       promise.then(function(user){
          //user is authenticated, get user id;
          var user_id = user._id
  
          //create store task
          var newTask = new Task({
          	   userId : user_id,
          	   task_name : req.body.task,
          	   task_location : req.body.location,
          	   task_description : req.body.desc,
          	   task_price : req.body.price,
          	   task_status : 0,
          });

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

       })
       .catch(function(err){
       	  console.log('error:' + err);
       	  res.json({
       	  	error: true,
       	  	message:'error occured' + err,
       	  });
       });
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

exports.requestTask = function(req,res,next){
	var task_id = req.body.task_id;
	var promise = Task.findById(task_id).exec();

	    promise.then(function(task){


           if(task.task_status == 1){
           		res.json({
       	  	     error: true,
       	  	     message:'Task has already been assigned',
       	       });
              return;
           }else if(task.task_status == 0){   
           	var task_name = task.task_name;

             newBid = new Bid({
             	request_from : req.body.request_from,
             	task_id : req.body.task_id,
             });
            
             bidPromise = newBid.save();

                bidPromise.then(function(bid){
	                res.json({
		       	  	     error: false,
		       	  	     message:'Request to perform task: ' + task_name + 'has been received.',
	       	       });
	                return bid;
                })

                .catch(function(err){
                	console.log('task_request err ' + err);
                    res.json({
		       	  	     error: true,
		       	  	     message:'Request not eccepted',
	       	          });
                });

           }
	    })
	    .catch(function(err){
	    	console.log('error occured ' + err)
	    	res.json({
       	  	error: true,
       	  	message:'error occured' + err,
       	  });
	    });
}


exports.confirm = function(req,res,next){
  var task = req.body.task;
      tasker = req.body.tasker;

      promise = Task.findById(task).exec();

      promise.then(function(task){
      	task.task_status = 1;
      	task.tasker = tasker;

        return task.save();
      })
       .catch(function(err){
       	console.log(err);
       	res.json({
       		error: true,
       		message: 'tasker not confirmed',
       	});
       });
}