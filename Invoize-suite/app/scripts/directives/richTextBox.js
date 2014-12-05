//http://hackerwins.github.io/summernote/


angularApp.directive('richText', function() {

	return {
		restrict: 'E',
		priority: 1,
		require: '?ngModel',
		// scope: true,
		link: function(scope, ele, tAttrs) {

			$(ele).summernote({

				height: 300, //set editable area's height
				width: 300,
				// codemirror: { // codemirror options
				// 	theme: 'monokai'
				// }

			});
		}
	};
});