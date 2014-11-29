root = exports ? this

#the index file redirection should happen on the server side. If logged in then home else landing.
root.angularApp = angular.module("angularApp", ["ui", 'ui.directives','ui.compat','ngCookies','ui.bootstrap','$strap.directives', 'blueimp.fileupload'])
  .config(["$stateProvider","$routeProvider","$urlRouterProvider","$locationProvider",'fileUploadProvider', ($stateProvider, $routeProvider, $urlRouterProvider, $locationProvider) ->
        $urlRouterProvider.
                otherwise("/main");
        $routeProvider.
                when("/home",
                        templateUrl: "home.html"
                        controller: "loginCtrl"
                        title: "Home").
                when("/register/success",
                        templateUrl: "registerSuccess.html"
                        controller: "loginCtrl"
                        title: "Register Success");
        $stateProvider.
                state("changePassword"
                        # abstract: true,
                        url: "/changePassword"
                        templateUrl: "changePassword.html"
                        controller: "loginCtrl"
                        permission: "changePassword"
                        title: "Change Password").
                state("wizard"
                        # abstract: true,
                        url: "/wizard"
                        templateUrl: "wizard.html"
                        permission: "wizard"
                        controller: "registerCtrl"
                        title: "Wizard").
                state("main"
                        # abstract: true,
                        url: "/main"
                        templateUrl: "main.html"
                        controller: "loginCtrl").
                state("main.landing"
                        url: "/landing"
                        views:"main":
                                templateUrl: "landing.html").
                state("main.register"
                        url: "/register"
                        views:"main":
                                templateUrl: "register.html").
                state("main.confirm"
                        url: "/confirm/:url"
                        views:"main":
                                templateUrl: "registerConfirm.html").
                state("permission"
                        # abstract: true,
                        url: "/permission"
                        templateUrl: "permission.html"
                        permission: "readPermission"
                        controller: "permissionCtrl"
                        title: "Permission").
                state("permission.new"
                        url: "/new"
                        title: "New Permission"
                        permission: "createPermission"
                        views:"list":
                                templateUrl: "permission.new.html").
                state("permission.detail"
                        url: "/:permission_name"
                        title: "Detail Permission"
                        permission: "readPermission"
                        views:"list":
                                templateUrl: "permission.detail.html").
                state("role"
                        # abstract: true,
                        url: "/role"
                        templateUrl: "role.html"
                        controller: "roleCtrl"
                        permission: "readRole"
                        title: "Role").
                state("role.new"
                        url: "/new"
                        title: "New Role"
                        permission: "createRole"
                        views:"list":
                                templateUrl: "role.new.html").
                state("role.detail"
                        url: "/:roleId"
                        title: "Detail Role"
                        permission: "readRole"
                        views:"list":
                                templateUrl: "role.detail.html").
                state("role.edit"
                        url: "/edit/:roleId"
                        title: "Edit Role"
                        permission: "updateRole"
                        views:"list":
                                templateUrl: "role.edit.html").
                state("group"
                        # abstract: true,
                        url: "/group"
                        title: "Group"
                        templateUrl: "group.html"
                        permission: "readGroup"
                        controller: "groupCtrl").
                state("group.new"
                        url: "/new"
                        title: "Group New"
                        permission: "createGroup"
                        views:"list":
                                templateUrl: "group.new.html").
                state("group.detail"
                        url: "/:groupId"
                        title: "Group Detail"
                        permission: "readGroup"
                        views:"list":
                                templateUrl: "group.detail.html").
                state("group.edit"
                        url: "/edit/:groupId"
                        title: "Group Edit"
                        permission: "updateGroup"
                        views:"list":
                                templateUrl: "group.edit.html").
                state("workflow"
                        # abstract: true,
                        url: "/workflow"
                        permission: "readWorkflow"
                        title: "Workflow"
                        templateUrl: "workflow.html"
                        controller: "workflowCtrl").
                state("workflow.new"
                        url: "/new"
                        permission: "createWorkflow"
                        title: "Workflow New"
                        views:"list":
                                templateUrl: "workflow.new.html").
                state("workflow.detail"
                        url: "/:workflowId"
                        permission: "readWorkflow"
                        title: "Workflow Detail"
                        views:"list":
                                templateUrl: "workflow.detail.html").
                state("workflow.edit"
                        url: "/edit/:workflowId"
                        permission: "updateWorkflow"
                        title: "Workflow Edit"
                        views:"list":
                                templateUrl: "workflow.edit.html").
                state("user"
                        # abstract: true,
                        url: "/user"
                        permission: "readUser"
                        templateUrl: "user.html"
                        title: "User"
                        controller: "userCtrl").
                state("user.new"
                        url: "/new"
                        permission: "createUser"
                        title: "User New"
                        views:"list":
                                templateUrl: "user.new.html").
                state("user.detail"
                        url: "/:userId"
                        permission: "readUser"
                        title: "User Detail"
                        views:"list":
                                templateUrl: "user.detail.html").
                state("user.edit"
                        url: "/edit/:userId"
                        permission: "updateUser"
                        title: "User Edit"
                        views:"list":
                                templateUrl: "user.edit.html").
                state("account"
                        # abstract: true,
                        url: "/account"
                        permission: "readAccount"
                        title: "Account"
                        templateUrl: "account.html"
                        controller: "accountCtrl").
                state("account.new"
                        url: "/new"
                        permission: "createAccount"
                        title: "Account New"
                        views:"list":
                                templateUrl: "account.new.html").
                state("account.detail"
                        url: "/:accountId"
                        permission: "readAccount"
                        title: "Account Detail"
                        views:"list":
                                templateUrl: "account.detail.html").
                state("account.edit"
                        url: "/edit/:accountId"
                        permission: "updateAccount"
                        title: "Account Edit"
                        views:"list":
                                templateUrl: "account.edit.html").
                state("organization"
                        # abstract: true,
                        url: "/organization"
                        permission: "readOrganization"
                        title: "Organization"
                        templateUrl: "organization.html"
                        controller: "organizationCtrl").
                state("organization.new"
                        url: "/new"
                        permission: "createOrganization"
                        title: "Organization New"
                        views:"list":
                                templateUrl: "organization.new.html").
                state("organization.detail"
                        url: "/:organizationId"
                        permission: "readOrganization"
                        title: "Organization Detail"
                        views:"list":
                                templateUrl: "organization.detail.html").
                state("organization.edit"
                        url: "/edit/:organizationId"
                        permission: "updateOrganization"
                        title: "Organization Edit"
                        views:"list":
                                templateUrl: "organization.edit.html").
                state("tms"
                        url: "/tms"
                        permission: "readTariff"
                        title: "TMS"
                        templateUrl: "tms.html"
                        controller: "tmsCtrl").
                state("tms.list"
                        url: "/list/:accountId"
                        permission: "readTariff"
                        title: "Tariffs"
                        views:"list":
                                templateUrl: "tms.list.html").
                state("tms.list.new"
                        url: "/new"
                        permission: "createTariff"
                        title: "New Tariff"
                        views:"detail":
                                templateUrl: "tms.new.html").
                state("tms.list.detail"
                        url: "/detail/:tariffId"
                        permission: "readTariff"
                        title: "Tariff Detail"
                        views:"detail":
                                templateUrl: "tms.detail.html").
                state("tms.list.account"
                        url: "/account/"
                        permission: "readAccount"
                        title: "TMS: Account Detail"
                        views:"detail":
                                templateUrl: "account.detail.html").
                state("tms.list.edit"
                        url: "/edit/:tariffId"
                        permission: "readTariff"
                        title: "Revise Tariff"
                        views:"detail":
                                templateUrl: "tms.revise.html").
                state("quote"
                        # abstract: true,
                        url: "/quote"
                        permission: "readQuote"
                        title: "Quote"
                        templateUrl: "quote.html"
                        controller: "quoteCtrl").
                state("quote.search"
                        url: "/search/:accountId/:quoteTemplateId"
                        views:"list":
                                templateUrl: "quote.search.html").
                state("quote.template"
                        url: "/template/:accountId"
                        views:"list":
                                templateUrl: "quote.template.html").
                state("quote.new"
                        url: "/new/:accountId/:quoteTemplateId"
                        permission: "createQuoteRequest"
                        title: "Quote New"
                        views:"list":
                                templateUrl: "quote.new.html").
                state("rate"
                        # abstract: true,
                        url: "/rate"
                        permission: "readRate"
                        title: "Rate"
                        templateUrl: "rate.html"
                        controller: "rateCtrl").
                state("rate.search"
                        url: "/search/:accountId/:templateId"
                        views:"list":
                                templateUrl: "rate.search.html").
                state("rate.template"
                        url: "/template/:accountId"
                        views:"list":
                                templateUrl: "rate.template.html").
                state("rate.new"
                        url: "/new/:accountId/:templateId"
                        permission: "createRateRequest"
                        title: "Rate New"
                        views:"list":
                                templateUrl: "rate.new.html").
                state("request"
                        # abstract: true,
                        url: "/request"
                        permission: "readRateRequest"
                        title: "Rate Request"
                        templateUrl: "rateRequest.html"
                        controller: "rateRequestCtrl").
                state("request.rateList"
                        url: "/rate/:requestType"
                        permission: "readRateRequest"
                        title: "Rate Request Type"
                        views:"list":
                                templateUrl: "rateRequest.list.html").
                state("request.rateList.detail"
                        url: "/:requestId"
                        permission: "readRateRequest"
                        title: "Rate Request Detail"
                        views:"detail":
                                templateUrl: "rateRequest.detail.html").
                state("request.tmsList"
                        url: "/tms/:requestType"
                        permission: "readTariff"
                        title: "Tms Request Type"
                        views:"list":
                                templateUrl: "tmsRequest.list.html").
                state("request.tmsList.detail"
                        url: "/detail/:requestId"
                        permission: "readTariff"
                        title: "Tms Request Detail"
                        views:"detail":
                                templateUrl: "tms.detail.html").
                state("request.tmsList.revise"
                        url: "/revise/:requestId"
                        permission: "readTariff"
                        title: "Tms Request Detail"
                        views:"detail":
                                templateUrl: "tms.revise.html").
                state("metadata"
                        # abstract: true,
                        url: "/metadata"
                        permission: "readMetadata"
                        templateUrl: "metadata.html"
                        controller: "metadataCtrl").
                state("metadata.new"
                        url: "/new"
                        permission: "createMetadataType"
                        views:"list":
                                templateUrl: "metadataType.new.html").
                state("metadata.list"
                        url: "/:metadataType"
                        permission: "readMetadata"
                        views:"list":
                                templateUrl: "metadata.list.html").
                state("metadata.list.new"
                        url: "/new"
                        permission: "createMetadata"
                        views:"detail":
                                templateUrl: "metadata.new.html").
                state("metadata.list.fileUpload"
                        url: "/fileUpload"
                        permission: "uploadMetadata"
                        views:"detail":
                                templateUrl: "fileUpload.html"
                                controller: "fileUploadCtrl").
                state("metadata.list.detail"
                        permission: "readMetadata"
                        url: "/:metadataId"
                        views:"detail":
                                templateUrl: "metadata.detail.html").
                state("metadata.list.edit"
                        permission: "editMetadata"
                        url: "/edit/:metadataId"
                        views:"detail":
                                templateUrl: "metadata.edit.html");
])

root.angularApp.run ($rootScope,$state,$stateParams,$route,$routeParams,$cookies) ->
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$route = $route;
        $rootScope.$routeParams = $routeParams;
        $rootScope.common = brand: "Invoize.";
        $rootScope.host = "invoize.info";
        $rootScope.isAuthenticated = false;
        # $rootScope.permissions =  [["requestNav","*","*"],["readRateRequest","*","*"],["readTariff","*","*"],["tariffApprove","*","*"],["uploadTariffDocument","*","*"],["historyTariff","*","*"],["deleteTariffDocument","*","*"]];
        $rootScope.permissions =  [["*","*","*"]];
        $rootScope.pendingRateRequestCount = 0;
        $rootScope.inProcessRateRequestCount = 0;
        $rootScope.pendingTmsRequestCount = 0;
        $rootScope.inProcessTmsRequestCount = 0;
        $rootScope.tooltip= (
                "delete": "Delete"
                "edit": "Edit"
                "back": "Back"
                "save": "Save"
                "upload": "Upload"
                "download": "Download"
                "new": "New"
                "sendRequest": "Send Request"
                "newRequest": "New Request"
                "approve": "Approve"
                "reject": "Reject"
                "showMore": "Click to view account list"
                "total": "Total Count"
                "attach": "Attach Files"
                "version": "Earlier Versions"
                "drop":"Drag & drop here"
                "upload": "Upload new version"
                "revise": "Revise this version"
                "undo": "Undo"
                "close": "Close"
                "rateRequestNew":"Please select account and definition to request a new rate"
                "expand": "click to 'expand' or 'collapse'"
                "clickToFilter": "Click to filter"
                "type": "Type"
                "accountDetails":"Account Details"
                "dateExample":"e.g. 2012-12-22"
                "detail":"click to view details"
        );

