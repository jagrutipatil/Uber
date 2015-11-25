var app = angular.module('loginCustomer', []);
app.controller("loginCustomerController", loginCustomerController);
loginCustomerController.$inject = [ '$scope', '$http', '$window'];
function loginCustomerController($scope, $http, $window) {
		
	//Function for signup
	$scope.signup = function() {				
		$http({
			method : 'POST',
			url : '/signup',
			data : {
				"firstname": $scope.firstname,
				"lastname" : $scope.lastname,
				"username" : $scope.username,
				"password" : $scope.password,
  			}
		}).success(function(response) {
			alert(response.result);
			alert("Success");
			$http({
				method : 'POST',
				url : '/signin',
			}).success(function(response) {
				alert("Success");
			}).error(function(error) {
				console.log(error);
			});
		}).error(function(error) {
			console.log(error);
		});
	};
	
	//Function for signin
	$scope.signin = function() {
		$http({
			method : 'POST',
			url : '/signin',
			data : {
				"username" : $scope.username,
				"password" : $scope.password
			}
		}).success(function(response) {
			console.log(response.result);
			alert(response.result);
		}).error(function(error) {
			console.log(error);
		});
	};
	
	
}