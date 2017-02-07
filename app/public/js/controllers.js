angular.module('ErrandGuy')
      .controller('HomeController',['$rootScope','$scope','$location','$localStorage','Main',function($rootScope,$scope,$location,$localStorage,Main){
   
               $scope.signIn = function () {
                    var formData = {
		                email: $scope.email,
		                password: $scope.password
                      }


		            Main.signin(formData, function(res) {
		                if (res.type == false) {
		                    alert(res.data)    
		                } else {
		                   $localStorage.token = res.data.token;
		                    
		                   console.log(res.data.token);
		                      window.location = "/"; 
		                }
		            }, function() {
		                $rootScope.error = 'Failed to signin';
		            })


                };

 
	           $scope.signup = function() {
		            var formData = {
		            	name:$scope.name,
		                email: $scope.email,
		                password: $scope.password
		            }

		            Main.save(formData, function(res) {
		                if (res.type == false) {
		                    alert(res.data)
		                } else {
		                    $localStorage.token = res.data.token;
		                   window.location = "/"   
		                    //console.log(res.data); 
		                }
		            }, function() {
		                $rootScope.error = 'Failed to signup';
		            })
 
	            };

	                $scope.user = function() {
			            Main.user(function(res) {
			              
			            if (res.type == false) {
		                    alert(res.data)
		                } else {
		                    $scope.myDetails = res.data;
		                    console.log(res.data); 
		                  }
			            }, function() {
			                $rootScope.error = 'Failed to fetch details';
			            })
			        };

			            $scope.logout = function() {
				            Main.logout(function() {
				            	//delete $localStorage.token;
				            	$localStorage.$clear();
				            	console.log("logged out");
				                window.location = "/"
				            }, function() {
				                alert("Failed to logout!");
				            });
				         };

        $scope.token = $localStorage.token;


      }])
       
     .controller('UserController',['$rootScope','$scope','$location','Main',function($rootScope,$scope,$location,Main){
     	Main.user(function(res){
     		$scope.myDetails = res;
     	},function(){
     		$rootScope.error = 'Failed to fetch details';
     	});
     }]);