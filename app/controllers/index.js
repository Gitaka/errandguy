exports.welcome = function(req,res){
	res.send({
		'message':'welcome to errand guy'
	});
}

exports.faq = function(req,res){
	res.render('faq');
};