app.controller("authCtrl", function($scope, $rootScope, $http, $filter, $timeout) {
	
	$scope.popupUrl = '';
	$scope.popupVisible = false;
	
	$rootScope.sharedVars = {
		activeHomey: false
	}
	
	$rootScope.$watch('sharedVars.activeHomey', function() {
		if( $rootScope.sharedVars.activeHomey !== false ) {
			window.localStorage.activeHomey = $rootScope.sharedVars.activeHomey
		}
	});
	
	$rootScope.$on('auth.login', function(){
		$scope.login();
	});
	
	$rootScope.$on('auth.logout', function(){
		$scope.logout();
	});
	
	$rootScope.$on('closePopup', function(){
		$rootScope.$emit('devkit.blur', false);
		$scope.popupVisible = false;
		$scope.popupUrl = '';
		$rootScope.user.status = 'logged-out';
	});
	
	$scope.login = function(){
		$scope.popupUrl = 'https://devkit.athom.nl/auth';
		$scope.popupVisible = true;
		$rootScope.user.status = 'logging-in';
		
		$timeout(function(){
			$rootScope.$emit('devkit.blur', true);
		}, 1);
		
	}
	
	$scope.logout = function(){
		$rootScope.user = {};
		$rootScope.user.status = 'logged-out';
		$rootScope.user.statusMessage = 'Log in';
		
		delete window.localStorage.access_token;
		delete window.localStorage.refresh_token;
		delete window.localStorage.activeHomey;
	}
	
	$scope.getUserInfo = function(){

		$rootScope.user.status = 'logging-in';
		$rootScope.user.statusMessage = 'Logging in...';
		
		$http
			.get('https://api.athom.nl/user/me')
			.success(function( data ){
												
				$rootScope.user.status = 'logged-in';
				$rootScope.user.statusMessage = data.firstname;
				
				$rootScope.user.firstname 	= data.firstname;
				$rootScope.user.lastname 	= data.lastname;
				$rootScope.user.email 		= data.email;
				$rootScope.user.avatar 		= data.avatar;
				
				$rootScope.user.homeys		= data.homeys;
				
				if( $rootScope.user.homeys.length > 0 ) {
				
					// if we have a prefered active homey, set it
					if( typeof window.localStorage.activeHomey == 'string' ) {
						
						// find if we still have access to that homey
						if( $filter('filter')( $rootScope.user.homeys, { _id: window.localStorage.activeHomey }, true ).length > 0 ) {
							$rootScope.sharedVars.activeHomey = window.localStorage.activeHomey;							
						} else {
							// select first Homey as active by default	
							$rootScope.sharedVars.activeHomey = $rootScope.user.homeys[0]._id;
						}
						
					} else {
						// select first Homey as active by default	
						$rootScope.sharedVars.activeHomey = $rootScope.user.homeys[0]._id;
					}
				} else {
					alert("You don't have access to any Homeys!");
				}
								
			})
			.error(function( data ){
				$rootScope.user.status = 'logged-out';
				$rootScope.user.statusMessage = 'Error logging in!';
				console.log(arguments)
			});
		
	}
	// listen for a message from the iframe
	window.addEventListener('message', function(e) {		
		$scope.$apply(function(){
			
			// save tokens to localStorage
			window.localStorage.access_token = e.data.accessToken;
			window.localStorage.refresh_token = e.data.refreshToken;
						
			$rootScope.$emit('devkit.blur', false);
			$scope.popupVisible = false;
			$scope.popupUrl = '';
			
			$scope.getUserInfo();
			
		});
	});
			
	if(	typeof $rootScope.user == 'undefined' ) {

		$rootScope.user = {};
				
		if( typeof window.localStorage.access_token == 'undefined' || typeof window.localStorage.refresh_token == 'undefined' ) {
			//$scope.login();
			$rootScope.user.status = 'logged-out';
			$rootScope.user.statusMessage = 'Log in';
		} else {
			$scope.getUserInfo();
		}
	}
	
});