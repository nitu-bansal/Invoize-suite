root = exports ? this
# for above line refer : http://stackoverflow.com/questions/4214731/coffeescript-global-variables
#//load the google chart & table library
google.load "visualization", "1",
  packages: [
    "corechart"
    "table"
  ]

#to do : the index file redirection should happen on the server side. If logged in then home else landing.
root.angularApp = angular.module("angularApp", ['ngGrid','ui2.select2','chieffancypants.loadingBar','ui','angularFileUpload','ui.bootstrap','ui.directives','ui.compat','ngCookies', 'blueimp.fileupload','restangular', 'ngResource','uiHandsontable','smartTable.table','ngDragDrop','ui.layout','localytics.directives','ui.bestselect'])
.config(["$stateProvider","$routeProvider","$urlRouterProvider","$locationProvider", 'fileUploadProvider','RestangularProvider', ($stateProvider, $routeProvider, $urlRouterProvider, $locationProvider, fileUploadProvider, RestangularProvider) ->
    RestangularProvider.setBaseUrl('/api');
    $urlRouterProvider.
    otherwise("/");
    $routeProvider
    .when("/test"
      templateUrl: "TestWork.html"
      title: "Test"
      controller: "workAllocationCtrl"
    )
    .when("/home"
        templateUrl: "home.html"
#        controller: "billRightCtrl"
        context:{product:"Home"}
        title: "Home")
    .when("/na"
        templateUrl: "notAuthorised.html"
        title: "Oops")
    .when("/notFound"
        templateUrl: "notFound.html"
        title: "Not Found")
    .when("/register/success"
        templateUrl: "registerSuccess.html"
        controller: "loginCtrl"
        title: "Register Success");
    $stateProvider.
    state("changePassword"
      url: "/changePassword"
      templateUrl: "changePassword.html"
      controller: "loginCtrl"
      title: "Change Password").
    state("main"
      url: "/main"
      templateUrl: "main.html"
      controller: "loginCtrl").
#    state("main.test"
#      # abstract: true,
#      url: "/test"
#      views: "main":
#        templateUrl: "TestOrgChart.html"
#        controller: "treeViewCtrl").
    state("main.signup" # signup page
      # abstract: true,
      url: "/signup"
      title: "SignUp"
      views: "main":
        templateUrl: "signUp.html"
        controller: "registrationCtrl").
    state("main.redirection" # rediaraction page
      # abstract: true,
      url: "/redirection/:id"
      title: "Redirecting..."
      views: "main":
        templateUrl: "redirection.html"
        controller: "redirectionCtrl").
    state("main.registration" # registration page
      # abstract: true,
      url: "/registration/:id"
      title: "Register"
      views: "main":
        templateUrl: "registration.html"
        controller: "registrationCtrl").
    state("main.invited"
      # abstract: true,
      url: "/userInvited/:id"
      views: "main":
        templateUrl: "user.edit.html"
        controller: "userProfileCtrl").
    state("main.user"
      # abstract: true,
      url: "/users/:id"
      views: "main":
        templateUrl: "user.edit.html"
        controller: "userProfileCtrl"
      title: "My Profile").
    state("main.landing" # login page
      url: "/landing"
      title: "Log In"
      views: "main":
        templateUrl: "landing.html").
    state("main.getstarted" # login page
      url: "/getstarted"
      title: "Get Started"
      views: "main":
        templateUrl: "getstarted.html").
    # state("main.register"
    #         url: "/register"
    #         views:"main":
    #                 templateUrl: "register.html").
    # state("main.confirm"
    #         url: "/confirm/:url"
    #         views:"main":
    #                 templateUrl: "registerConfirm.html").
    state("payright"
      # abstract: true,
      url: "/payright"
      permission: "payright"
      title: "Pay Right"
      templateUrl: "payright.html"
      controller: "payrightCtrl").
    state("payright.invoiceList"
      url: "/invoice/:statusId"
      permission: "payright"
      title: "Payright - Invoices"
      views: "list":
        templateUrl: "invoice.list.html"
        controller: "invoiceCtrl").
    state("payright.invoiceList.detail"
      url: "/:invoiceId"
      permission: "payright"
      title: "Payright - Invoices"
      views: "detail":
        templateUrl: "invoice.detail.html").
    state("payright.paymentList"
      url: "/payment/:statusId"
      permission: "payright"
      title: "Payright - Payments"
      views: "list":
        templateUrl: "payment.list.html"
        controller: "paymentCtrl").
    state("payright.paymentList.detail"
      url: "/:paymentId"
      permission: "payright"
      title: "Payright - Payments"
      views: "detail":
        templateUrl: "payment.detail.html").
    state("payright.shipmentList"
      url: "/shipment/:statusId"
      permission: "payright"
      title: "Payright - Shipments"
      views: "list":
        templateUrl: "shipment.list.html"
        controller: "shipmentCtrl").
    state("payright.shipmentList.detail"
      url: "/:paymentId"
      permission: "payright"
      title: "Payright - Shipments"
      views: "detail":
        templateUrl: "shipment.detail.html").
    state("payright.vendor"
      url: "/vendor"
      permission: "createProfile"
      title: "Payright - Vendors"
      views: "list":
        templateUrl: "profile.html"
        controller: "profileCtrl").
    state("payright.vendor.new"
      url: "/new"
      permission: "createProfile"
      title: "Payright - New Vendor Profile"
      views: "list":
        templateUrl: "profile.new.html"
        controller: "profileCtrl").
    state("payright.vendor.detail"
      url: "/:profileId"
      permission: "readTariff"
      title: "Payright - Vendor Details"
      views: "list":
        templateUrl: "profile.detail.html"
        controller: "profileCtrl").
    state("payright.vendor.edit"
      url: "/edit/:profileId"
      permission: "readTariff"
      title: "Payright - Edit Vendor Profile"
      views: "list":
        templateUrl: "profile.edit.html"
        controller: "profileCtrl").
    state("payright.jobCard"
      url: "/jobCard"
      permission: "readJobCard"
      title: "Payright - JobCard"
      views: "list":
        templateUrl: "profile.html").
    state("payright.jobCard.new"
      url: "/new"
      permission: "createJobCard"
      title: "Payright - New jOB card"
      views: "list":
        templateUrl: "jobCard.edit.html"
        controller: "searchPanelCtrl").
    state("payright.jobCard.edit"
      url: "/edit/:jobCardId"
      permission: "updateJobCard"
      title: "Payright - Edit Vendor Profile"
      views: "list":
        templateUrl: "jobCard.edit.html"
        controller: "searchPanelCtrl").
    state("billright"
      url: "/billright"
      permission: "navBillright"
      context:{product:"Bill Right",module:"billRight"}
      title: "Bill Right"
      templateUrl: "billRight.html"
      controller: "billRightCtrl").
    state("billright.charts"
      url: "/charts"
      permission: "billrightCharts"
      context:{product:"Bill Right",module:"charts"}
      title: "Charts"
      views: "contents":
        templateUrl: "billRightCharts.html").
    state("billright.summary"
      url: "/summary"
      resolve: promiseObj: ($http) -> return $http.get("api/summaryHeaders");
      permission: "billrightSummary"
      context:{product:"Bill Right",module:"summary"}
      title: "Summary"
      views: "contents":
        templateUrl: "BPRSummary.html"
        controller: "billRightDashboardCtrl").
    state("billright.HWBStatusReport"
      url: "/HWBStatusReport"
      title: "HWB Status Report"
      permission: ""
      context:{product:"Bill Right"}
      views: "contents":
        templateUrl: "hawbStatusReport.html"
        controller: "hawbStatusReportCtrl").
    state("billright.shipmentEntry"
      url: "/shipmentEntry"
      context:{product:"Bill Right",module:"shipmentEntry"}
      permission: "sideShipmentEntry"
      title: "Shipment Processing"
      views: "contents":
        templateUrl: "shipment.processing.html"
        controller: "shipmentProcessCtrl").
    state("billright.shipmentEntry.pending"
      context:{product:"Bill Right",module:"shipmentEntry"}
      url: "/pending/:account/:accountID/:emailID"
      permission: "sideShipmentEntry"
      title: "Shipment Processing"
      views: "contents":
        templateUrl: "shipment.processing.html"
        controller: "shipmentProcessCtrl"
        data:"accountData").
    state("billright.invoiceProcessing"
      url: "/invoiceProcessing"
      context:{product:"Bill Right",module:"invoiceProcessing"}
      permission: "sideInvoiceProcessing"
      title: "Invoice Processing"
      views: "contents":
        templateUrl: "invoice.processing.html"
        controller: "invoiceProcessCtrl").
    state("billright.calculationCode"
      url: "/calculationCode"
      permission: "calculationCode"
      context:{product:"Bill Right"}
      title: "Calculation Code"
      views: "contents":
        templateUrl: "calculationCode.html"
        controller: "calculationCodeCtrl").
    state("billright.calculationCode.view"
      url: "/view"
      permission: "sideCalculationCode"
      context:{product:"Bill Right",module:"calculationCode"}
      title: "Calculation Code View"
      views: "childContents":
        templateUrl: "calculationCode.view.html").
    state("billright.calculationCode.new"
      url: "/new"
      permission: "createCalculationCode"
      context:{product:"Bill Right",module:"calculationCode"}
      title: "Calculation Code New"
      views: "childContents":
        templateUrl: "calculationCode.new.html").
    state("billright.calculationCode.edit"
      url: "/edit/:id"
      permission: "editCalculationCode"
      context:{product:"Bill Right",module:"calculationCode"}
      title: "Calculation Code Edit"
      views: "childContents":
        templateUrl: "calculationCode.edit.html").
    state("billright.invoizeDelivery"
      url: "/invoizeDelivery"
      permission: "sideInvoiceDelivery"
      context:{product:"Bill Right",module:"invoiceDelivery"}
      title: "Invoize Delivery"
      views: "contents":
        templateUrl: "shipment.invoizeDelivery.html"
        controller: "invoiceDeliveryCtrl").
    state("billright.invoizeDelivery.webInvoice"
      url: "/webInvoice"
      permission: "sideInvoiceDelivery"
      context:{product:"Bill Right",module:"invoiceDelivery"}
      title: "Web Invoice"
      views: "childContents":
        templateUrl: "webDelivery.html").
    state("billright.invoizeDelivery.edi"
      url: "/edi"
      permission: ""
      context:{product:"Bill Right"}
      title: "EDI Delivery"
      views: "childContents":
        templateUrl: "ediDelivery.html").
    state("billright.invoizeDelivery.email"
      url: "/email"
      permission: ""
      context:{product:"Bill Right"}
      title: "Email Delivery"
      views: "childContents":
        templateUrl: "emailDelivery.html").
    state("billright.invoizeDelivery.paper"
      url: "/paper"
      context:{product:"Bill Right"}
      title: "Paper Delivery"
      views: "childContents":
        templateUrl: "paperDelivery.html").
    state("billright.invoizeDelivery.web"
      url: "/web"
      permission: ""
      context:{product:"Bill Right"}
      title: "Web Delivery"
      views: "childContents":
        templateUrl: "webDelivery.html").
    state("billright.invoizeDelivery.deliveredInvoice"
      url: "/deliveredInvoice"
      permission: ""
      context:{product:"Bill Right"}
      title: "Delivery"
      views: "childContents":
        templateUrl: "deliveredInvoice.html").
    state("billright.invoizeDelivery.unDeliveredInvoice"
      url: "/unDeliveredInvoice"
      permission: ""
      context:{product:"Bill Right"}
      title: "All"
      views: "childContents":
        templateUrl: "unDeliveredInvoice.html").
    
    state("billright.documentManagement"
      url: "/documentManagement"
      permission: "sideDocumentRepository"
      title: "Document Management"
      context:{product:"Bill Right",module:"documentRepository"}
      views: "contents":
        templateUrl: "tms.documentManagement.html"
        controller: "tmsDocManageCtrl").
    state("billright.tariffRepository"
      url: "/tariffManagement"
      permission: "sideTariffRepository"
      context:{product:"Bill Right",module:"tariffRepository"}
      title: "Tariff Management"
      views: "contents":
        templateUrl: "tms.tariffManagement.html"
        controller: "tmsTariffManageCtrl").
    state("billright.tariffRepository.listTariff"
      url: "/listTariff"
      permission: ""
      context:{product:"Bill Right",module:"tariffRepository"}
      title: ""
      views: "childContents":
        templateUrl: "tariffManagement.listTariff.html").
    state("billright.tariffRepository.newTariff"
      url: "/newTariff/:accountId"
      permission: ""
      context:{product:"Bill Right",module:"tariffRepository"}
      title: "Add new Tariff"
      views: "childContents":
        templateUrl: "tariffManagement.newTariff.html").
    state("billright.tariffRepository.viewTariff"
      url: "/viewTariff/:accountId/:templateId"
      permission: ""
      context:{product:"Bill Right",module:"tariffRepository"}
      title: "Tariff Template"
      views: "childContents":
        templateUrl: "tariffManagement.newTariff.html").
    state("billright.tariffRepository.editTeriff"
      url: "/editTariff/:templateId"
      permission: ""
      context:{product:"Bill Right",module:"tariffRepository"}
      title: "View / edit Tariff"
      views: "childContents":
        templateUrl: "tariffManagement.editTariff.html").
    state("billright.tariffLane"
      url: "/tariffLane"
      permission: "tariffLaneView"
      context:{product:"Bill Right",module:"tariffLane"}
      title: "Tariff Lane"
      views: "contents":
        templateUrl: "teriffLane.html"
        controller: "tmsTariffManageCtrl").
    state("billright.tariffLane.editTeriff"
      url: "/editTariff/:templateId"
      permission: "tariffLaneView"
      context:{product:"Bill Right",module:"tariffLane"}
      title: "View / edit Tariff"
      views: "childContents":
        templateUrl: "tariffManagement.editTariff.html").
    state("billright.linkdocument"
      url: "/linkDocument"
      permission: ""
      context:{product:"Bill Right"}
      title: "Link document"
      views: "contents":
        templateUrl: "tms.linkDocument.html"
        controller: "tmsTariffManageCtrl").
    state("billright.breackage"
      url: "/breackage"
      permission: "readbillright"
      title: "Breackage"
      context:{product:"Bill Right"}
      views: "contents":
        templateUrl: "tms.breackage.html"
        controller: "breakageCtrl").
    state("billright.documentManagement.detail"
      url: "/documentManagement"
      context:{product:"Bill Right"}
      permission: ""
      title: "Document Management"
      views: "tmsAccountData":
        templateUrl: "tms.documentManagement.detail.html").
    state("billright.IMS"
      url: "/ims"
      permission: "sideIMS"
      context:{product:"Bill Right",module:"ims"}
      title: "collaborate"
      views: "contents":
        templateUrl: "ims.html"
        controller: "imsCtrl").

    state("billright.workAllocation"
      url: "/WorkAllocation"
      permission: "sideWorkAllocation"
      context:{product:"Bill Right",module:"workAllocation"}
      title: "Work Allocation"
      views: "contents":
        templateUrl: "workAllocation.html"
        controller: "workAllocationCtrl").
    state("billright.approvalRequest"
        url: "/approvalRequest"
#        permission: "sideapprovalRequest"
        context:{product:"Bill Right",module:"approvalRequest"}
        title: "Approval Request Management"
        views: "contents":
            templateUrl: "approvalRequest.html"
            controller: "approvalRequestCtrl").
    state("billright.approvalRequest.my"
        url: "/my"
#        permission: "sideapprovalRequest"
        context:{product:"Bill Right",module:"approvalRequest"}
        title: "Approval Request Management"
        views: "contents":
            templateUrl: "approvalRequest.html"
            controller: "approvalRequestCtrl").
    state("billright.approvalRequest.myapproved"
        url: "/myapproved"
#        permission: "sideapprovalRequest"
        context:{product:"Bill Right",module:"approvalRequest"}
        title: "Approval Request Management"
        views: "contents":
            templateUrl: "approvalRequest.html"
            controller: "approvalRequestCtrl").
    state("billright.approvalRequest.myrejected"
        url: "/myrejected"
#        permission: "sideapprovalRequest"
        context:{product:"Bill Right",module:"approvalRequest"}
        title: "Approval Request Management"
        views: "contents":
            templateUrl: "approvalRequest.html"
            controller: "approvalRequestCtrl").
    state("billright.approvalRequest.mypending"
        url: "/mypending"
#        permission: "sideapprovalRequest"
        context:{product:"Bill Right",module:"approvalRequest"}
        title: "Approval Request Management"
        views: "contents":
            templateUrl: "approvalRequest.html"
            controller: "approvalRequestCtrl").
    state("billright.approvalRequest.pending"
        url: "/pending"
#        permission: "sideapprovalRequest"
        context:{product:"Bill Right",module:"approvalRequest"}
        title: "Approval Request Management"
        views: "contents":
            templateUrl: "approvalRequest.html"
            controller: "approvalRequestCtrl").
    state("organizationSetup"
      url: "/organizationSetup"
      permission: "navOrganization"
      context:{product:"Admin"}
      title: "Organization Setup"
      templateUrl: "organizationSetup.html"
      controller: "organizationSetupCtrl").
    state("organizationSetup.permission"
      # abstract: true,
      url: "/permission"
      permission: "readPermission"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "permission.html"
        controller: "permissionCtrl"
      title: "Permission").
    state("organizationSetup.permission.new"
      url: "/new"
      title: "New Permission"
      permission: "createPermission"
      context:{product:"Admin"}
      views: "list":
        templateUrl: "permission.new.html").
    state("organizationSetup.permission.detail"
      url: "/:permission_name"
      title: "Detail Permission"
      permission: "readPermission"
      context:{product:"Admin"}
      views: "list":
        templateUrl: "permission.detail.html").
    state("organizationSetup.company"
      # abstract: true,
      url: "/company"
      views: "contents":
        templateUrl: "company.html"
        controller: "companyCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "Company").
    state("organizationSetup.company.new"
      url: "/new"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.new.html"
      title: "Company New").
    state("organizationSetup.company.view"
      url: "/view"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.view.html"
      title: "Company View").
    state("organizationSetup.company.Hview"
      url: "/viewH"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.Hview.html"
      title: "Company Hierarchy View"
      controller: "treeViewCtrl").
    state("organizationSetup.company.details"
      url: "/details/:companyId"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.details.html"
      title: "Company Detail").
    state("organizationSetup.company.edit"
      url: "/edit/:companyId"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.edit.html"
      title: "Company Edit").
    state("organizationSetup.system"
      # abstract: true,
      url: "/system"
      views: "contents":
        templateUrl: "system.html"
        controller: "systemCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "System").
    state("organizationSetup.system.new"
      url: "/new"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.new.html"
      title: "System New").
    state("organizationSetup.system.view"
      url: "/view"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.view.html"
      title: "System View").
    state("organizationSetup.system.details"
      url: "/details/:systemId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.details.html"
      title: "System Detail").
    state("organizationSetup.system.edit"
      url: "/edit/:systemId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.edit.html"
      title: "System Edit").
    state("organizationSetup.system.profile"
      url: "/profile/:systemName/:systemId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.edit.profile.html"
        controller: "profilesConfigCtrl"
      title: "System Profiles").
    state("organizationSetup.system.profile.shipmentrules"
      url: "/shipmentRules"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "account.edit.rules.html"
        # controller:"userProfileCtrl"
      title: "System Shipment Profiles").
    state("organizationSetup.system.profile.location"
      url: "/location"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "location.detail.html"
        controller: "locationCtrl"
      title: "System Profiles").
    state("organizationSetup.system.profile.account"
      url: "/account"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "account.edit.html"
        controller: "accountCtrl"
      title: "System Profiles").
    state("organizationSetup.system.profile.account.invoicerules"
      url: "/Invoicerules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.rules.html"
        controller: "accountRulesCtrl"
      title: "System Profiles").
    state("organizationSetup.system.profile.account.shipmentrules"
      url: "/Shipmentrules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
          templateUrl: "account.edit.rules.html"
          controller: "accountRulesCtrl"
      title: "Account Shipment Profiles").
    state("organizationSetup.system.profile.account.invoicedeliveryrules"
      url: "/InvoiceDeliveryrules"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
          templateUrl: "account.edit.rules.html"
          controller: "accountRulesCtrl"
          title: "Invoice Delivery Mode").
    state("organizationSetup.system.profile.account.InvoicedeliveryEdirules"
      url: "/InvoiceDeliveryEDIrules"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
        templateUrl: "InvoiceDeliveryEDI.html"
        controller: "InvoiceDeliveryEDICtrl"
        title: "Invoice Delivery Edi Mode").
    state("organizationSetup.system.profile.account.InvoicedeliveryEdirules.view"
      url: "/view"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "InvoiceDeliveryEDI.view.html"
        title: "Invoice Delivery Edi Mode").
    state("organizationSetup.system.profile.account.InvoicedeliveryEdirules.new"
      url: "/new"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "InvoiceDeliveryEDI.new.html"
        title: "Invoice Delivery Edi Mode").
    state("organizationSetup.system.profile.account.InvoicedeliveryEdirules.edit"
      url: "/:metadataId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "InvoiceDeliveryEDI.edit.html"
        title: "Invoice Delivery Edi Mode").
    state("organizationSetup.system.profile.account.InvoiceDeliveryEmailrules"
      url: "/InvoiceDeliveryEmailrules"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
        templateUrl: "invoiceDeliveryEmail.html"
        controller: "invoiceDeliveryEmailCtrl"
        title: "Invoice Delivery Email Mode").
    state("organizationSetup.system.profile.account.InvoiceDeliveryEmailrules.view"
      url: "/view"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryEmail.view.html"
      title: "Invoice Delivery Email Mode View").
     state("organizationSetup.system.profile.account.InvoiceDeliveryEmailrules.new"
      url: "/new"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryEmail.new.html"
        controller: "notificationCtrl"
      title: "Invoice Delivery Email Mode New").
     state("organizationSetup.system.profile.account.InvoiceDeliveryEmailrules.detail"
      url: "/detail/:invoiceDeliveryEmailId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryEmail.detail.html"
      title: "Invoice Delivery Email Mode Detail").
     state("organizationSetup.system.profile.account.InvoiceDeliveryEmailrules.edit"
      url: "/edit/:invoiceDeliveryEmailId"
      permission: "notification"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryEmail.edit.html"
        controller: "notificationCtrl"
      title: "Invoice Delivery Email Mode Edit").
      state("organizationSetup.system.profile.account.InvoiceDeliveryWebrules"
      url: "/InvoiceDeliveryWebrules"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
        templateUrl: "invoiceDeliveryWeb.html"
        controller: "invoiceDeliveryWebCtrl"
        title: "Invoice Delivery Web Mode").
    state("organizationSetup.system.profile.account.InvoiceDeliveryWebrules.view"
      url: "/view"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryWeb.view.html"
      title: "Invoice Delivery Web Mode View").
     state("organizationSetup.system.profile.account.InvoiceDeliveryWebrules.new"
      url: "/new"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryWeb.new.html"
        title: "Invoice Delivery Web Mode New").
     state("organizationSetup.system.profile.account.InvoiceDeliveryWebrules.detail"
      url: "/detail/:invoiceDeliveryWebId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryWeb.detail.html"
      title: "Invoice Delivery Web Mode Detail").
     state("organizationSetup.system.profile.account.InvoiceDeliveryWebrules.edit"
      url: "/edit/:invoiceDeliveryWebId"
      permission: "notification"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "invoiceDeliveryWeb.edit.html"
        
      title: "Invoice Delivery Web Mode Edit").
    state("organizationSetup.system.profile.account.InvoiceDeliveryDocProfilerules"
        url: "/InvoiceDeliveryDocProfilerules"
        permission: "system"
        context:{product:"Admin"}
        views: "rulesContents":
            templateUrl: "docProfile.html"
            controller: "docProfileCtrl"
        title: "Invoice Delivery Documents Profile").
    state("organizationSetup.system.profile.account.InvoiceDeliveryDocProfilerules.new"
        url: "/new"
        permission: "system"
        context:{product:"Admin"}
        views: "childContents":
            templateUrl: "docProfile.new.html"
            title: "Invoice Delivery Documents Profile New").
    state("organizationSetup.system.profile.account.InvoiceDeliveryDocProfilerules.view"
        url: "/view"
        permission: "system"
        context:{product:"Admin"}
        views: "childContents":
            templateUrl: "docProfile.view.html"
        title: "Invoice Delivery Documents Profile View").
    state("organizationSetup.system.profile.account.InvoiceDeliveryDocProfilerules.edit"
        url: "/edit/:docProfileId"
        permission: "system"
        context:{product:"Admin"}
        views: "childContents":
            templateUrl: "docProfile.edit.html"

        title: "Invoice Delivery Documents Profile Edit").
    state("organizationSetup.system.profile.account.InvoiceDeliveryDocProfilerules.detail"
        url: "/detail/:docProfileId"
        permission: "system"
        context:{product:"Admin"}
        views: "childContents":
            templateUrl: "docProfile.detail.html"
        title: "Invoice Delivery Documents Profile Detail").
    state("organizationSetup.system.profile.account.invoiceDeliveryRuleNew"
      url: "/invoiceDeliveryRuleNew"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
        templateUrl: "invoiceDeliveryRule.new.html"
        controller: "invoiceDeliveryRuleCtrl"
      title: "Invoice Delivery Mode").
    state("organizationSetup.system.profile.account.invoiceDeliveryRuleDetails"
      url: "/invoiceDeliveryRuleDetails/:invoiceDeliveryModeID"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
        templateUrl: "invoiceDeliveryRule.details.html"
        controller: "invoiceDeliveryRuleCtrl"
      title: "Invoice Delivery Mode Details").
    state("organizationSetup.system.profile.account.invoiceDeliveryRuleEdit"
      url: "/invoiceDeliveryRuleEdit/:invoiceDeliveryModeID"
      permission: "system"
      context:{product:"Admin"}
      views: "invoiceDeliveryRulesContents":
        templateUrl: "invoiceDeliveryRule.edit.html"
        controller: "invoiceDeliveryRuleCtrl"
      title: "Invoice Delivery Mode Details").
    state("organizationSetup.system.profile.account.chargerules"
      url: "/Chargerules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.chargeRule.html"
        controller: "accountChargeCtrl"
      title: "Charge Rules").
    state("organizationSetup.system.profile.account.metadatarules"
      url: "/metadatarules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.metadata.html"
        controller: "accountMetadataCtrl").
    state("organizationSetup.system.profile.account.edit"
      url: "/edit"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContentsUploadDoc":
        templateUrl: "account.profile.edit.html"
        controller: "accountProfileCtrl"
      title: "Upload Documents").
    state("organizationSetup.system.profile.account.Upload"
      url: "/Upload"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContentsUploadDoc":
        templateUrl: "account.profile.html"
        controller: "accountProfileCtrl"
      title: "Upload Documents").
    state("organizationSetup.system.profile.metadata"
      url: "/metadata"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "system.metadata.html"
        controller: "systemMetadataCtrl"
      title: "System Profiles").
    state("organizationSetup.system.profile.dataSource"
      url: "/dataSource"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "dataSource.html"
        controller: "dataSourceCtrl"
      title: "System Profiles").
    state("organizationSetup.location"
      # abstract: true,
      url: "/location"
      views: "contents":
        templateUrl: "location.html"
        controller: "locationCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "Location").
    state("organizationSetup.location.new"
      url: "/new"
      permission: "location"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "location.new.html"
      title: "Location New").
    state("organizationSetup.location.view"
      url: "/view"
      permission: "location"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "location.view.html"
      title: "Location View").
    state("organizationSetup.location.locationDetails"
      url: "/locationDetails/:templateId"
      permission: "location"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "location.detail.html"
      title: "Location Detail").
    state("organizationSetup.operation"
      # abstract: true,
      url: "/operation"
      views: "contents":
        templateUrl: "operation.html"
        controller: "operationCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "Operation").
    state("organizationSetup.operation.new"
      url: "/new"
      permission: "operation"
      context:{product:"Admin",module:"company"}
      views: "childContents":
        templateUrl: "operation.new.html"
      title: "operation").
    state("organizationSetup.operation.view"
      url: "/view"
      permission: "operation"
      context:{product:"Admin",module:"company"}
      views: "childContents":
        templateUrl: "operation.view.html"
      title: "Operation View").
    state("organizationSetup.operation.operationDetails"
      url: "/operationDetails/:templateId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "operation.detail.html"
      title: "Operation Detail").
    state("organizationSetup.accounts"
      # abstract: true,
      url: "/accounts"
      views: "contents":
        templateUrl: "account.html"
        controller: "accountCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "Account").
    state("organizationSetup.accounts.new"
      url: "/new"
      permission: "accounts"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "account.new.html"
      title: "Account New").
    state("organizationSetup.accounts.view"
      url: "/view"
      permission: "accounts"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "account.view.html"
      title: "Account View").
    state("organizationSetup.accounts.edit"
      url: "/edit/:templateId"
      permission: "accounts"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "account.edit.html"
      title: "Account Edit").
    state("organizationSetup.users"
      # abstract: true,
      url: "/users"
      views: "contents":
        templateUrl: "user.html"
        controller: "userProfileCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "User").
    state("organizationSetup.users.new"
      url: "/new"
      permission: "users"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "user.new.profile.html"
      title: "User New").
    state("organizationSetup.users.detail"
      url: "/detail"
      permission: "users"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "user.detail.html"
      title: "User Details").
    state("organizationSetup.users.invite"
      url: "/invite"
      permission: "users"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "user.invite.html"
      title: "User Invite").
    state("organizationSetup.role"
      # abstract: true,
      url: "/role"
      views: "contents":
        templateUrl: "role.html"
        controller: "roleCtrl"
      permission: "readRole"
      context:{product:"Admin"}
      title: "Role").
    state("organizationSetup.role.new"
      url: "/new"
      title: "New Role"
      permission: "createRole"
      context:{product:"Admin"}
      views: "list":
        templateUrl: "role.new.html").
    state("organizationSetup.role.detail"
      url: "/:roleId"
      title: "Detail Role"
      permission: "readRole"
      context:{product:"Admin"}
      views: "list":
        templateUrl: "role.detail.html").
    state("organizationSetup.role.edit"
      url: "/edit/:roleId"
      title: "Edit Role"
      permission: "updateRole"
      context:{product:"Admin"}
      views: "list":
        templateUrl: "role.edit.html").
    state("organizationSetup.group"
     url: "/group"
     permission: "Group"
     views: "contents":
       templateUrl: "group.html"
       controller: "groupCtrl"
     title: "Group").
    state("organizationSetup.group.new"
     url: "/new"
     permission: "Group New"
     context:{product:"Admin"}
     title: "Group New/Clone"
     views: "childContents":
       templateUrl: "group.new.html").
    state("organizationSetup.group.view"
     url: "/view"
     title: "Group View"
     permission: "viewGroup"
     context:{product:"Admin"}
     views: "childContents":
       templateUrl: "group.view.html").
    state("organizationSetup.group.detail"
     url: "/:groupId"
     title: "Group Details"
     permission: "viewGroup"
     views: "childContents":
       templateUrl: "group.detail.html").
    state("organizationSetup.group.edit"
      url: "/edit/:groupId"
      title: "Edit Group"
      permission: "editGroup"
      views: "childContents":
        templateUrl: "group.edit.html").
    state("organizationSetup.accessRight"
      url: "/accessRight"
      title: "access right"
      permission: "create permission"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "accessRight.html"
        controller: "accessCtrl").
    state("organizationSetup.accessRight.module"
      url: "/module"
      permission: "create permission"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "accessRight.module.html"
        title: "Access Right").
    state("organizationSetup.metadata"
      # abstract: true,
      url: "/metadata"
      views: "contents":
        templateUrl: "metadata.html"
        controller: "metadataCtrl"
      permission: "metadata"
      context:{product:"Admin"}
      title: "Metadata").
    state("organizationSetup.metadata.view"
      url: "/view"
      permission: "metadata"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "metadataType.view.html"
      title: "Metadata View").
    state("organizationSetup.metadata.new"
      url: "/new"
      permission: "metadata"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "metadataType.new.html"
      title: "Metadata New").
    state("organizationSetup.metadata.edit"
      url: "/edit/:metadataTypeId"
      permission: "metadata"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "metadataType.edit.html"
      title: "Metadata Edit").
    state("organizationSetup.metadata.detail"
      url: "/:metadataTypeId/detail"
      permission: "metadata"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "metadataType.detail.html"
      title: "Metadata Detail").
    state("organizationSetup.notification"
      url: "/notification"
      views: "contents":
        templateUrl: "notification.html"
        controller: "notificationCtrl"
      permission: "metadata"
      context:{product:"Admin"}
      title: "Notification").
    state("organizationSetup.notification.view"
      url: "/view"
      permission: "notification"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "notification.view.html"
      title: "Notification View").
    state("organizationSetup.notification.new"
      url: "/new"
      permission: "notification"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "notification.new.html"
      title: "Notification New").
    state("organizationSetup.notification.detail"
      url: "/detail/:notificationId"
      permission: "notification"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "notification.detail.html"
      title: "Notification Detail").
    state("organizationSetup.notification.edit"
      url: "/edit/:notificationId"
      permission: "notification"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "notification.edit.html"
      title: "Notification Edit").

    state("organizationSetup.approval"
      url: "/approval"
      views: "contents":
        templateUrl: "approval.html"
        controller: "approvalCtrl"
      permission: "sideApproval"
      context:{product:"Admin",module:"approval"}
      title: "Notification").
    state("organizationSetup.approval.view"
      url: "/view"
      permission: "approval"
      context:{product:"Admin",module:"approval"}
      views: "childContents":
        templateUrl: "approval.view.html"
      title: "Approval View").
    state("organizationSetup.approval.new"
      url: "/new"
      permission: "approval"
      context:{product:"Admin",module:"approval"}
      views: "childContents":
        templateUrl: "approval.new.html"
      title: "Approval New").
    state("organizationSetup.approval.details"
      url: "/details/:approvalId"
      permission: "approval"
      context:{product:"Admin",module:"approval"}
      views: "childContents":
        templateUrl: "approval.details.html"
      title: "Approval Detail").
    state("organizationSetup.approval.edit"
      url: "/edit/:approvalId"
      permission: "approval"
      context:{product:"Admin",module:"approval"}
      views: "childContents":
        templateUrl: "approval.edit.html"
      title: "Approval Edit").
    # state("emailConfiguration"
    #   url: "/emailConfiguration"
    #   templateUrl: "emailConfigure.html"
    #   controller: "emailConfigureCtrl"
    #   title: "Email Configuration").
    # state("organizationSetup.system.profile.emailnotification"
    #   url: "/emailnotification"
    #   permission: "system"
    #   views: "emailnotificationContents":
    #     templateUrl: "emailnotification.html"
    #     controller: "notificationCtrl"
    #   title: "System Profiles").
    state("wizard"
      url: "/wizard"
      permission: "wizard"
      context:{product:"Admin"}
      title: "Wizard"
      templateUrl: "org_wizard.html"
      controller: "wizardCtrl").
    state("wizard.group"
       url: "/group"
       permission: "Group"
       context:{product:"Admin"}
       views: "contents":
         templateUrl: "group.html"
         controller: "groupCtrl"
       title: "Group").
     state("wizard.group.new"
       url: "/new"
       permission: "Group New"
       context:{product:"Admin"}
       views: "childContents":
         templateUrl: "group.new.html"
         title: "Group").
     state("wizard.group.view"
       url: "/view"
       title: "Group"
       permission: "viewGroup"
       context:{product:"Admin"}
       views: "childContents":
         templateUrl: "group.view.html").
     state("wizard.group.detail"
       url: "/:groupId"
       title: "Group"
       permission: "viewGroup"
       context:{product:"Admin"}
       views: "childContents":
         templateUrl: "group.detail.html").
    state("wizard.group.edit"
      url: "/edit/:groupId"
      title: "Edit Group"
      permission: "editGroup"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "group.edit.html").
    state("wizard.company"
      url: "/company"
      permission: "company"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "company.html"
        controller: "companyCtrl"
      title: "company").
    state("wizard.company.new"
      url: "/new"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.new.html"
      title: "Company New").
    state("wizard.company.view"
      url: "/view"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.view.html"
      title: "Company View").
    state("wizard.company.Hview"
      url: "/viewH"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.Hview.html"
      title: "Company Hierarchy View"
      controller: "treeViewCtrl").
    state("wizard.company.details"
      url: "/details/:companyId"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.details.html"
      title: "Company Details").
    state("wizard.company.edit"
      url: "/edit/:companyId"
      permission: "company"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "company.edit.html"
      title: "Company Edit").
    state("wizard.system"
      url: "/system"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "system.html"
        controller: "systemCtrl"
      title: "System").
    state("wizard.system.new"
      url: "/new"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.new.html"
      title: "System New").
    state("wizard.system.view"
      url: "/view"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.view.html"
      title: "System View").
    state("wizard.system.details"
      url: "/details/:systemId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.details.html"
      title: "System details").
    state("wizard.system.edit"
      url: "/edit/:systemId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.edit.html"
      title: "System Edit").
    state("wizard.system.profile"
      url: "/profile/:systemName/:systemId"
      permission: "system"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "system.edit.profile.html"
        controller: "profilesConfigCtrl"
      title: "System Profile").
    state("wizard.system.profile.shipmentrules"
      url: "/shipmentRules"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "account.edit.rules.html"
#        controller:"profilesConfigCtrl"
      ).
    state("wizard.system.profile.metadata"
      url: "/metadata"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "system.metadata.html"
        controller: "systemMetadataCtrl"
      title: "System Profiles").
    state("wizard.system.profile.dataSource"
      url: "/dataSource"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "dataSource.html"
        controller: "dataSourceCtrl"
      title: "System Profiles").
    state("wizard.system.profile.location"
      url: "/location"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "location.detail.html"
        controller: "locationCtrl"
      title: "System Profiles").
    state("wizard.system.profile.account"
      url: "/account"
      permission: "system"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "account.edit.html"
        controller: "accountCtrl"
      title: "System Profiles").
    state("wizard.system.profile.account.invoicerules"
      url: "/Invoicerules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.rules.html"
        controller: "accountRulesCtrl"
      title: "System Profiles").
    state("wizard.system.profile.account.shipmentrules"
      url: "/Shipmentrules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.rules.html"
        controller: "accountRulesCtrl").
    state("wizard.system.profile.account.invoicedeliveryrules"
      url: "/InvoiceDeliveryrules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.rules.html"
        controller: "accountRulesCtrl").
    state("wizard.system.profile.account.invoicedeliveryrulesNew"
      url: "/invoicedeliveryrulesNew"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "invoiceDeliveryRuleNew.html"
        controller: "invoiceDeliveryRuleCtrl").
    state("wizard.system.profile.account.chargerules"
      url: "/Chargerules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.chargeRule.html"
        controller: "accountChargeCtrl").
    state("wizard.system.profile.account.rules"
      url: "/rules"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContents":
        templateUrl: "account.edit.rules.html"
        controller: "accountRulesCtrl"
      title: "System Profiles").
    state("wizard.system.profile.account.edit"
      url: "/edit"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContentsUploadDoc":
        templateUrl: "account.profile.edit.html"
        controller: "accountProfileCtrl"
      title: "Upload Documents").
    state("wizard.system.profile.account.Upload"
      url: "/Upload"
      permission: "system"
      context:{product:"Admin"}
      views: "rulesContentsUploadDoc":
        templateUrl: "account.profile.html"
        controller: "accountProfileCtrl"
      title: "Upload Documents").
    state("wizard.system.profile.account.InvoiceDeliveryDocProfilerules"
        url: "/InvoiceDeliveryDocProfilerules"
        permission: "system"
        context:{product:"Admin"}
        views: "rulesContents":
            templateUrl: "docProfile.html"
            controller: "docProfileCtrl"
        title: "Invoice Delivery Documents Profile").
    state("wizard.location"
      url: "/location"
      permission: "location"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "location.html"
        controller: "locationCtrl"
      title: "Location").
    state("wizard.location.new"
      url: "/new"
      permission: "location"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "location.new.html"
      title: "Location New").
    state("wizard.location.view"
      url: "/view"
      permission: "location"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "location.view.html"
      title: "Location View").
    state("wizard.location.locationDetails"
      url: "/locationDetails/:templateId"
      permission: "location"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "location.detail.html"
      title: "Location Details").
    state("wizard.operation"
      url: "/operation"
      permission: "operation"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "operation.html"
        controller: "operationCtrl"
      title: "Operation").
    state("wizard.operation.new"
      url: "/new"
      permission: "operation"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "operation.new.html"
      title: "Operation New").
    state("wizard.operation.view"
      url: "/view"
      permission: "operation"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "operation.view.html"
      title: "Operation View").
    state("wizard.operation.operationDetails"
      url: "/operationDetails/:templateId"
      permission: "operation"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "operation.detail.html"
      title: "Operation Details").
    state("wizard.accounts"
      url: "/accounts"
      permission: "accounts"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "account.html"
        controller: "accountCtrl"
      title: "Account").
    state("wizard.accounts.new"
      url: "/new"
      permission: "accounts"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "account.new.html"
      title: "Account New").
    state("wizard.accounts.view"
      url: "/view"
      permission: "accounts"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "account.view.html"
      title: "Account View").
    state("wizard.accounts.edit"
      url: "/edit/:templateId"
      permission: "accounts"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "account.edit.html"
      title: "Account Edit").
    state("wizard.users"
      url: "/users"
      permission: "users"
      context:{product:"Admin"}
      views: "contents":
        templateUrl: "user.html"
        controller: "userProfileCtrl"
      title: "User").
    state("wizard.users.new"
      url: "/new"
      permission: "users"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "user.new.profile.html"
      title: "User New").
    state("wizard.users.detail"
      url: "/detail"
      permission: "users"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "user.detail.html"
      title: "User Details").
    state("wizard.users.invite"
      url: "/invite"
      permission: "users"
      context:{product:"Admin"}
      views: "childContents":
        templateUrl: "user.invite.html"
      title: "User Registration");
  ])

.run ($rootScope,$state,$routeParams,$route) ->
  $rootScope.common = brand: "Invoize.";
  $rootScope.loggedInUser = {};
  $rootScope.isCevaUser = null;


  $rootScope.host = "invoizet.com";
  #$rootScope.host = "dev.invoize.info";
  # $rootScope.host = "test.invoize.info";
  # $rootScope.host = "uat.invoize.info";
  #$rootScope.host = "live.invoize.info";


  $rootScope.$state = $state;
  $rootScope.$route = $route;
  $rootScope.$routeParams = $routeParams;
