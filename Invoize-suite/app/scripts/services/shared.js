'use strict';
angularApp.service('sharedService', function($rootScope) {

    var docID = []; //used in uploader.js controller and can be accessed by using this service reference
    var RevisedDocs = [];
    var ExistingDocs = [];
    var tariff = {};

    return {

        setExistingDocs: function(d) { //used in tms.js controller for initializing and can be accessed by using this service reference
            ExistingDocs = d;
            console.log(ExistingDocs);
        },
        setDocumentId: function(d) {
            docID = d;
            // if (docID.length > 0) {
            console.log('setDocumentId:' + docID);
            $rootScope.$broadcast('docExists', docID);
            // }
        },
        getDocumentId: function() {
            return docID;
        },
        IsNewDocAttached: function() {
            if (docID.length > 0)
                return true;
            else
                return false;
        },
        setAccountIDTariff: function(t) {
            tariff = t;
        },
        getAccountIDTariff: function() {
            return tariff;
        },
        setRevisedDocId: function(o, n) {
            var x = {};
            var notFound = true;

            angular.forEach(RevisedDocs, function(i, j) {
                if (i._id === o.id) {
                    x = {
                        "id": i.id,
                        "v": i.v,
                        "t": i.t,
                        "_id": o.id,
                        "_v": o.v,
                        "_t": o.t
                    };
                    RevisedDocs.splice(j, 1);
                    notFound = false;
                }
            });

            if (notFound)
                x = {
                    "id": n.id,
                    "v": n.v,
                    "t": n.t,
                    "_id": o.id,
                    "_v": o.v,
                    "_t": o.t
                };
            RevisedDocs.push(x);


        },
        getFinalDocuments: function() {
            var f = ExistingDocs;
            for (var i = f.length - 1; i >= 0; i--) {
                angular.forEach(RevisedDocs, function(k, l) {
                    if (k._id === f[i].id) {
                        f.splice(i, 1);
                        f.push(k);
                    }
                });
            }
            console.log("files to be saved : ");
            console.log(f);
            return f;
        },

        updateExistingFileType: function(id, t) {
            var x = {};
            console.log(RevisedDocs);
            angular.forEach(RevisedDocs, function(i, j) {

                if (i._id === id) {
                    x = i;
                    x.t = t;
                    RevisedDocs.splice(j, 1);
                }
            });
            RevisedDocs.push(x);
            console.log("revised existing type");
            console.log(x);

        },

        resetFileRevision: function(id) {
            var x = {};
            angular.forEach(RevisedDocs, function(i, j) {
                if (i._id === id) {
                    x = {
                        "id": i._id,
                        "v": i._v,
                        "t": i._t
                    };
                    RevisedDocs.splice(j, 1);
                    RevisedDocs.push(x);
                    console.log('removed from array');
                }
            });
        },

        updateNewFileType: function(id, t) {
            var x = {};
            angular.forEach(docID, function(i, j) {
                if (i.id === id) {
                    x = i;
                    x.t = t;
                    docID.splice(j, 1);
                }
            });
            docID.push(x);
            console.log("revised new type");
            console.log(x);
        },

        removeExistingDocumentId: function(d) {
            angular.forEach(ExistingDocs, function(i, j) {
                if (i.id === d) {
                    ExistingDocs.splice(j, 1);
                }
            });
            return ExistingDocs;
        },
        removeNewDocumentId: function(d) {
            angular.forEach(docID, function(i, j) {
                if (i.id === d) {
                    docID.splice(j, 1);
                }
            });
            console.log(docID);
            $rootScope.$broadcast('docExists', docID);
            return docID;
        },
        clearDocumentId: function() {
            docID = [];
            RevisedDocs = [];
        }

    };
});