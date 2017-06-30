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
               res.json({
                 error:false,
                 message:"user Found",
                 data:user,
               });
           }
         
       };

       ifAuthenticated(handleAuthenticationRequest,req.token);


 db.bids.update({'user':'58ac9ea68fa27318a0f0e9c0'},{$set:{'tempAmount':'200'}})
       

 db.invoices.update({'task_id':'58d92a16ea119c0334a22860'},{$set:{'task_owner':'58d8ee4cae10331ca80474c6'}})

  db.accounts.update({'userId':'58ac9ea68fa27318a0f0e9c0'},{$set:{'tempAmount':'200'}})

  db.tournaments.update({'userId':'58ac9ea68fa27318a0f0e9c0'},{$set:{'tempAmount':'200'}})


  db.accounts.remove({'userId':"58d9067c339d0916ec9c7c9c"},1)  //delete only one record
  db.accounts.deleteOne({"_id" : ObjectId("58d907a5339d0916ec9c7c9f")})



                          var promise = Invoice.findOne({task_id:task._id}).exec();
                            promise.then(function(invoice){
                              res.json({
                                data:invoice,
                              });
                            });