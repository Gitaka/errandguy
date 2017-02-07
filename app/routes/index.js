var index = require('../controllers/index.js');
var user = require('../controllers/user.js');
var task = require('../controllers/tasks.js');

module.exports = function(app){
	app.get('/',index.welcome);

	app.post('/register',user.register);
	app.post('/authenticate',user.auth); 
	app.post('/authenticate/otp',user.authOtp);
    app.get('/user',ensureAuthorized,user.user);

    //add tasks
    app.get('/tasks',task.getTasks);
    app.post('/createTask',task.createTask);
    app.post('/requestTask',task.requestTask);
    app.post('/confirmRequest',task.confirm); 



}


/*
  request headers are intercepted and the authorize headers is extracted,
  If a bearer token exists in this header, that token is assigned to req.token in order to be used throughout the request, and the request can be continued by using next(). If a token does not exist, 
  you will get a 403 (Forbidden) response

*/
ensureAuthorized = function(req,res,next){
	var bearerToken;
	var bearerHeader = req.headers['authorization'];

	if(typeof bearerHeader !== 'undefined'){
		var bearer = bearerHeader.split(" ");
		bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	}else{
 
        res.status(403).send("forbidden");
	}
}