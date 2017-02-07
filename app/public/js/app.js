
(function() {


	var app = angular.module('ErrandGuy', [
		'ngRoute',
		'ngStorage',
	]);

	app.config(['$routeProvider','$httpProvider', function ($routeProvider,$httpProvider) {
		$routeProvider
           .when('/', {
				templateUrl: '../views/main.html'
			})
           .when('/signin', {
				templateUrl: '../views/signin.html'
			})
			.when('/signup', {
				templateUrl: '../views/register.html'
			})
           .when('/user', {
                templateUrl: '../views/user.html'
            })
			.otherwise({
				templateUrl: '../views/404.html'
			});

/*
when ever we need to make a request to the backend on the protected routes,the token need to be out in the headers
We've used angularJS interceptors to hijack the request and insert the bearer token to the authorization header field

*/
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                    return config;
                },
                'responseError': function(response) {
                    if(response.status === 401 || response.status === 403) {
                        $location.path('/signin');
                    }
                    return $q.reject(response);
                }
            };
        }]);



	}]);

	
})();