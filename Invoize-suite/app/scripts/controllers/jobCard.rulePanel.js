angularApp.controller('rulePanelCtrl', function($scope, item, dialog) {
	$scope.item = item; //{action:item.v,actionCode:"",expiredOn:"",description:""};   
	$scope.fields = [];
	$scope.operators = [{
		"name": "=",
		"label": "is",
		"cardinality": "ONE"
	}, {
		"name": "<>",
		"label": "is not",
		"cardinality": "ONE"
	}, {
		"name": "<",
		"label": "less than",
		"cardinality": "ONE"
	}, {
		"name": ">",
		"label": "greater than",
		"cardinality": "ONE"
	}, {
		"name": "In",
		"label": "In",
		"cardinality": "MULTIPLE"
	}, {
		"name": "Exists in",
		"label": "ExistsIn",
		"cardinality": "MULTIPLE"
	}];
	$scope.tables = [{
		"name": "Invoice",
		"columns": [{
			"name": "Invoice number",
			"label": "Invoice number",
			"type": "STRING",
			"size": 20
		}, {
			"name": "Invoice date",
			"label": "Invoice date",
			"type": "STRING",
			"size": 20
		}, {
			"name": "Invoice amount",
			"label": "Invoice amount",
			"type": "STRING",
			"size": 20
		}]
	}, {
		"name": "Payments",
		"columns": [{
			"name": "Payment Id",
			"label": "Payment Id",
			"type": "STRING",
			"size": 20
		}, {
			"name": "Invoice number",
			"label": "Invoice number",
			"type": "STRING",
			"size": 20
		}, {
			"name": "Vendor Id",
			"label": "Vendor Id",
			"type": "STRING",
			"size": 20
		}]
	}, {
		"name": "Shipments Details",
		"columns": [{
			"name": "HAWB no",
			"label": "HAWB no",
			"type": "STRING",
			"size": 20
		}, {
			"name": "Origin",
			"label": "Origin",
			"type": "STRING",
			"size": 20
		}, {
			"name": "Destination",
			"label": "Destination",
			"type": "STRING",
			"size": 20
		}]
	}];

	$scope.listBar = {
		placeholder: "Please Select..",
		allowClear: true,
		multiple: true,
		data: [{
			id: 0,
			text: ''
		}],
		createSearchChoice: function(term, data) {
			if ($(data).filter(function() {
				return this.text.localeCompare(term) === 0;
			}).length === 0) {
				return {
					id: term,
					text: term
				};
			}
		}
	};

	function formatResult(data) {
		var markup = "<div>" + data.v + "</div>";
		return markup;
	}

	function formatSelection(data) {
		return data.v;
	}

	$scope.reportNameChanged = function() {
		console.log(item);
		$scope.fields = [];
		angular.forEach($scope.tables, function(i, j) { // loop over otherFields lists with i as object from list and j as index of that object
			if (i.name === $scope.item.config.reportName) { // check if other fields object is same as selectedOtherField
				$scope.fields = i.columns;
			}
		});
	}
	$scope.close = function() {
		dialog.close(undefined);
	};

	$scope.save = function() {
		dialog.close($scope.item);
	};

	angular.forEach($scope.tables, function(i, j) { // loop over otherFields lists with i as object from list and j as index of that object
		if (i.name === $scope.item.config.reportName) { // check if other fields object is same as selectedOtherField
			$scope.fields = i.columns;
		}
	});
});