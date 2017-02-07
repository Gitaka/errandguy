var express = require('express');
    bodyParser = require('body-parser');
    cookieParser = require('cookie-parser');
    methodOverride = require('method-override');
    morgan = require('morgan');
    compression = require('compression');
    path = require('path'),
    jwt = require('jsonwebtoken');
    request = require('request');

module.exports = function(){
  var app = express();

  if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
  }else if(process.env.NODE_ENV === 'development'){
    app.use(compression);
  }


  process.env.JWT_SECRET = 'SuperSecretErrandGuy';
  //app.set('SeedExSecret','ilovescotchyscotch');
  
  process.on('uncaughtException', function(err) {
    console.log(err);
  });

   app.use(express.static(path.join(__dirname,'../app/public')));
   
   app.use(bodyParser.urlencoded({
    extended:false
   }));

   app.use(bodyParser.json());
   app.use(methodOverride());

   app.use(cookieParser());



   
   /*
     Allow requests to come from diffrent domains in order to develop a client-independent system
     and prevent triggering Cross Origin Request Sharing error
     
     Access-Control-Allow-Origin - allow for all domains
     X-Requested-with and content-type headers are allowed

   */
   app.use(function(req,res,next){
      res.setHeader('Access-Control-Allow-Origin','*');
      res.setHeader('Access-Control-Allow-Methods','GET,POST');
      res.setHeader('Access-Control-Allow-Headers','X-Requested-with,content-type,Authorization');
      next();
   }); 
 



   app.set('views','./app/public/views');
   app.set('view engine','ejs');

   require('../app/routes/index.js')(app);
   
   //require('../app/routes/user.routes.js')(app);
  return app;

}