angular.module('ErrandGuy')
    .factory('Main',['$http','$localStorage',function($http,$localStorage){
    	var baseUrl = "http://127.0.0.1:1337";
        //http://127.0.0.1:1337/authenticate
        function changeUser(user) {
            angular.extend(currentUser, user);
        }


    	function urlBase64Decode(str){
    	  var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            //console.log(window.atob(output));
            return window.atob(output);
    	}

        function getUserFromToken(){
        	var token = $localStorage.token;
        	var user = {};
        	if(typeof token !== 'undefined'){
        		var encoded = token.split('.')[1];
        		user = JSON.parse(urlBase64Decode(encoded));
        	}

        	return user;
        }

        var currentUser = getUserFromToken();

        return{
        	save:function(data,success,error){
               $http.post(baseUrl + '/register', data).success(success).error(error)
        	},
        	signin:function(data,success,error){
        		$http.post(baseUrl + '/authenticate',data).success(success).error(error)
        	},
            user: function(success, error) {
                $http.get(baseUrl + '/user').success(success).error(error)
            },
            logout: function(success) {
                changeUser({});
                delete $localStorage.token;
                success();
            }
        };

    }]);