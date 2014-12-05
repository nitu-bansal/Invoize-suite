//angularApp.controller('treeViewCtrl', function($scope) {
//
//     $scope.data = [{
//         name: 'GIPS',
//         children: [{
//             name: 'GIPS 1',
//             children: [{
//                 name: 'Umesh'
//             }, {
//                 name: 'Keyur'
//             }]
//         }, {
//             name: 'GIPS 2',
//             children: [{
//                 name: 'Sushrut'
//             }, {
//                 name: 'Keyur'
//             }]
//         }]
//         ,
//         name: 'GIPS X',
//         children: [{
//              name: 'GIPS x1',
//              children: [{
//                  name: 'Umesh X'
//              }, {
//                  name: 'Keyur X'
//              }]
//         }, {
//              name: 'GIPS x2',
//              children: [{
//                  name: 'Sushrut X'
//              }, {
//                  name: 'Keyur X'
//              }]
//         }]
//     }];
//
//
//     function updateLater() {
//         // save the timeoutId for canceling
//         setTimeout(function() {
//             $('#organisation').orgChart({
//                 container: $("#main")
//             });
//         }, 1000);
//     }
//     updateLater();
//});

angularApp.controller('treeViewCtrl', function($scope, commonService, flash) {
    $scope.json = '';
    // $scope.CurrentStackHolder = [];

    $scope.data = {
        "children": [
            {
                "company": "Microsoft",
                "system": [],
                "companyid": "52a84566c210b205dbeb79a1",
                "children": [
                    {
                        "system": [],
                        "company": "Toboto",
                        "children": [],
                        "companyid": "52a84566c210b205dbeb79a1"
                    },
                    {
                        "system": [],
                        "company": "GO Daddy",
                        "children": [],
                        "companyid": "52a844c3c210b205dbeb7997"
                    },
                    {
                        "system": [],
                        "company": "Come to Daddy",
                        "children": [],
                        "companyid": "52a84426c210b205dbeb7995"
                    },
                    {
                        "system": [],
                        "company": "Zingora",
                        "children": [],
                        "companyid": "52a843ecc210b205dbeb7993"
                    },
                    {
                        "system": [],
                        "company": "UBI Soft",
                        "children": [],
                        "companyid": "52a843cbc210b205dbeb7991"
                    },
                    {
                        "system": [],
                        "company": "Meow",
                        "children": [],
                        "companyid": "52a8438cc210b205dbeb798e"
                    },
                    {
                        "system": ["Dynamic", "Complex", "FSO", "UFO", "LHS", "RHS", "DOG", "CAT", "RAT", "Aviya"],
                        "company": "NewSoft",
                        "children": [],
                        "companyid": "52a32c49c210b2117fe8eb21"
                    }
                ]
            }
        ]
    };

    $scope.getJson = function () {
        $scope.templateLoader = true;
        var promise = commonService.ajaxCall('GET', '/api/treeview?type=company');

        // $scope.CurrentStackHolder = [];
        promise.then(function (result) {

            $scope.data = result;

            // var desc;
            // angular.forEach($scope.data, function(i, j) {
            //     desc = "";
            //     // i.system.forEach(function(item) {
            //     //     desc += item + '\n';
            //     // });
            //     //desc += i.children.company + '\n';
            //     // console.writeline(i.company);
            //     $scope.CurrentStackHolder.push(desc.slice(0, -1));

            // });

        }, function (result) {
            flash.pop({
                title: 'Alert',
                body: "Please try after sometime..!",
                type: 'error'
            });
            $scope.templateLoader = false;
        });
    };

    $scope.getJson(
        $scope.json = angular.toJson($scope.data));

    //
    // $scope.getJson = function() {
    //     $scope.json = angular.toJson($scope.data);
    // };

    // $scope.toggleMinimized = function(child) {
    //     child.minimized = !child.minimized;
    // };

    // $scope.addChild = function(child) {
    //     child.children.push({
    //         title: '',
    //         children: []
    //     });
    // };

    // $scope.remove = function(child) {
    //     function walk(target) {
    //         var children = target.children,
    //             i;
    //         if (children) {
    //             i = children.length;
    //             while (i--) {
    //                 if (children[i] === child) {
    //                     return children.splice(i, 1);
    //                 } else {
    //                     walk(children[i])
    //                 }
    //             }
    //         }
    //     }
    //     walk($scope.data);
    // }

    // $scope.update = function(event, ui) {

    //     var root = event.target,
    //         item = ui.item,
    //         parent = item.parent(),
    //         target = (parent[0] === root) ? $scope.data : parent.scope().child,
    //         child = item.scope().child,
    //         index = item.index();

    //     target.children || (target.children = []);

    //     function walk(target, child) {
    //         var children = target.children,
    //             i;
    //         if (children) {
    //             i = children.length;
    //             while (i--) {
    //                 if (children[i] === child) {
    //                     return children.splice(i, 1);
    //                 } else {
    //                     walk(children[i], child);
    //                 }
    //             }
    //         }
    //     }
    //     walk($scope.data, child);

    //     target.children.splice(index, 0, child);
    // };


    function updateLater() {
        // save the timeoutId for canceling
        $("#left").hide();
        setTimeout(function () {

            $('#organisation').orgChart({
                container: $("#main")
            });

        }, 4500);


        // setTimeout(function() {
        //     $('#organisation').orgChart({
        //         container: $("#left").visible = false;
        //     });
        // }, 8000);
    }

    updateLater();

});