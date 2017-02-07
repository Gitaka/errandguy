var mongoose = require('mongoose');

module.exports = function(){
	//var connectionUri = 'mongodb://127.0.0.1/errandguy';
	var connectionUri = process.env.MONGODB_URI;
	//'mongodb://seedexadmin:seedslayers@ds021915.mlab.com:21915/seedex';
	var db = mongoose.connect(connectionUri);


	require('../app/models/user.js');
	require('../app/models/smsCodes.js');
	require('../app/models/tasks.js');
	require('../app/models/bids.js');

	return db
};