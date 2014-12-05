'use strict';

angularApp.controller('registrationCtrl', function($scope, $location, $window, $rootScope, flash, Restangular,  $routeParams) {
	Restangular.setFullResponse = true;
	var baseregister = Restangular.all('register');
	var basesignUp = Restangular.all('signUp');
	var baseConfirm = Restangular.all('confirm');
	$scope.organization = {};
	$scope.organization.id = $routeParams.id;
	// $scope.visibleRegisterSuccessMsg=false;

	$scope.reset = function() {
		$scope.organization = null;
		$scope.confirmPassword = null;
	}
	$scope.register = function(organization) {
		$scope.registrationLoader = true;
		baseregister.post(organization).then(function(result) {
			//$scope.registrationLoader = false;
			// $scope.visibleRegisterSuccessMsg=true;
			//if (result.type === 1) {
			$window.location.href = "http://" + result.subDomain + "." + $rootScope.host + "/#/main/landing";
			flash.pop({
				title: 'Registration done successfully.',
				body: result.msg,
				type: 'success'
			});

			// } else if (result.type === 0) {
			// 	$window.location.href = "http://" + result.msg + "." + $rootScope.host + "/#/main/signup";
			// 	flash.pop({
			// 		title: 'Registration failed.',
			// 		body: result.msg,
			// 		type: 'waring'
			// 	});
			// }

			// $location.path("main/landing");
		}, function(result) {
			$scope.registrationLoader = false;
			flash.pop({
				title: 'Registration failed.',
				body: result.data,
				type: 'error'
			});
		});

	}
	$scope.signUp = function(organization) {
		$scope.signUpLoader = true;
		$scope.signUpSuccess = false;

		basesignUp.post(organization).then(function(result) {
			$scope.signUpLoader = false;
			$scope.signUpSuccess = true;
			flash.pop({
				title: 'Success ',
				body: 'Verification mail sent, Please check your mail for further instructions.', //+result.msg,
				type: 'success'
			});
			$scope.organization = null;
		}, function(result) {
			$scope.signUpLoader = false;
			flash.pop({
				title: 'Please try again later',
				body: result.data,
				type: 'error'
			});
		});

	}



	$scope.confirm = function() {


		var urldata = {
			data: $routeParams.id
		}
		baseConfirm.post(urldata).then(function(data) {
			// if (data.type === 1)
			// { // Email Confirmed : Do Nothing
			// 	flash.pop({
			// 		title: 'Success',
			// 		body: data.msg,
			// 		type: 'success'
			// 	});
			// 	$window.location.href = "http://" + $rootScope.host + "/#/main/registration/"+$routeParams.id;
			// }
			// if (data.type === 2) { // Simply Re-opend emailed Link : Do nothing
			// 	flash.pop({
			// 		title: 'Information',
			// 		body: data.msg,
			// 		type: 'info'
			// 	});
			// 	$window.location.href = "http://" + $rootScope.host + "/#/main/registration/"+$routeParams.id;
			// }
			if (data.type === 2) { // Re-opend emailed Link after registration Confirmed : send to login					
				$window.location.href = "http://" + data.subDomain + "." + $rootScope.host + "/#/main/landing";
				flash.pop({
					title: 'Information',
					body: data.msg,
					type: 'info'
				});
			}
			// if (data.type === 4) { // Emailed Link Expired : Send to Signup
			// 	flash.pop({
			// 		title: 'Information',
			// 		body: data.msg,
			// 		type: 'info'
			// 	});
			// 	$window.location.href = "http://" + $rootScope.host + "/#/main/signup";
			// }

		}, function(msg) {
			$scope.message = msg.data;
			flash.pop({
				title: 'Alert',
				body: msg.data,
				type: 'error'
			});
			$window.location.href = "http://" + $rootScope.host + "/#/main/signup";
		});

	}

	$scope.formatResult = function(data) {
		if (data.g === "group")
			var markup = "<div><i class='icon-group'></i>  " + $scope.toHumanReadable(data.n) + "</div>";
		else
			var markup = "<div><i class='icon-user'></i>  " + $scope.toHumanReadable(data.n) + "</div>";
		return markup;
	}

	$scope.formatSelection = function(data) {
		if (data.g === "group")
			return "<i class='icon-group'></i>  " + $scope.toHumanReadable(data.n);
		else
			return "<i class='icon-user'></i>  " + $scope.toHumanReadable(data.n);
	}

	$scope.moduleBar = {
		placeholder: "Select Module",
		minimumInputLength: 0,
		multiple: true,
		ajax: {
			method: 'POST',
			url: "/api/suggestion",
			dataType: 'json',
			quietMillis: 100,
			data: function(term, page) { // page is the one-based page number tracked by Select2
				return {
					q: term, //search term
					pageLimit: 10, // page size
					page: page, // page number
					selected: '', //selected values
					suggestionFor: "modules", // suggestions for
					//   apikey: "ju6z9mjyajq2djue3gbvv26t" // please do not use so this example keeps working
				};
			},
			results: function(data, page) {
				var data = data
				data.total = 100;
				if (data.msg.length < 10)
					var more = false
				else
					var more = (page * 10) < data.total;
				return {
					results: data.msg,
					more: more
				};
			}
		},
		initSelection: function(element, callback) {
			callback($(element).data('$ngModelController').$modelValue);
		},
		formatResult: $scope.formatResult, // omitted for brevity, see the source of this page
		formatSelection: $scope.formatSelection, // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function(m) {
			return m;
		} // we do not want to escape markup since we are displaying html in results
	};


	$scope.carouselInterval = 5000;
	$scope.next = function() {

		console.log('s');
	}

	// $scope.slides = [{
	// 	image: 'styles/images/bg.png'
	// }, {
	// 	image: 'styles/images/bg2.jpg'
	// }, {
	// 	image: 'styles/images/bg3.jpg'
	// }];
	// $.mask.definitions['~'] = '[+-]';
	// $('.input-mask-phone').mask('+99 -(999) 999-9999');



	/*----------------------------- ADDED BY SHRIDHAR*/

	$('.carousel').carousel({
		interval: 8000
	});


	$('.signin-modal').click(function() {
		$('#myModal').modal();
	});

	//var cW = $('.in-logo-txt').width() + 100;
	var hL = $('#in-head').offset().left;
	var hW = $('#in-head').width();
	var wW = $(window).width();
	var wH = $(window).height();

	$('.select2-container.in-txt').css('min-width', '370px');

	/*$('.carousel-inner > .item').css('height', wH);*/
	$('.item .container').css({
		'left': hL
	});
	$('.in-logo-txt').css({
		'margin-left': -(hW / 2)
	});

	$(window).resize(function() {
		//cW = $('.in-logo-txt').width() + 100;
		hL = $('#in-head').offset().left;
		hW = $('#in-head').width();
		wW = $(window).width();
		wH = $(window).height();

		/*$('.carousel-inner > .item').css('height', wH);*/
		$('.item .container').css({
			'left': hL
		});
		/*$('.in-logo-txt').css({
			'margin-left': -(hW / 2)			
		});	*/
	});

	/*$('.in-info img').hover(function()
	{
		//alert('hi');
		$(this).find('img').animate({padding:'0px'}, 500);
	}
	,function()
	{
		$(this).find('img').animate({padding:'25px'}, 500);
	});*/
	$('.in-infocon').css('background-color', $('.item.active').attr('bg-col'));
	$('#carousel-example-generic .item.active').find('.in-logo-txt').animate({
		marginLeft: '0px',
		opacity: 1
	}, 1200);
	setTimeout(function() {
		$('#carousel-example-generic .item.active').find('.in-des-txt').animate({
			opacity: 1
		}, 1200);
	}, 1200);

	$('#carousel-example-generic').on('slid', function() {
		$('#carousel-example-generic .active').find('.in-logo-txt').animate({
			marginLeft: '0px',
			opacity: 1
		}, 1200);
		$('.in-infocon').css('background-color', $('.item.active').attr('bg-col'));
		setTimeout(function() {
			$('#carousel-example-generic .active').find('.in-des-txt').animate({
				opacity: 1
			}, 1200);
		}, 1200);
	});

	$('#carousel-example-generic').on('slide.bs.carousel', function() {
		$('.in-logo-txt').css({
			'margin-left': -(hW / 2),
			'opacity': 0
		});
		$('.in-des-txt').css({ /*'left':hL,*/
			'opacity': 0
		});
	});
})