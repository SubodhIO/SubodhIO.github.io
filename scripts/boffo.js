var app = angular.module("boffo", ["ui.router", "bpwa"]);

app.service("boffoDataService", function() {
  this.events = [{ name: "event1" },{ name: "event2" },{ name: "event3" }];
  this.polls = [{ name: "poll1" },{ name: "poll2" }];
  this.queries = [{ name: "query1" },{ name: "query2" },{ name: "query3" }];
  this.proposals = [{ name: "proposal" }];

  this.getEvents = function() {
    return this.events;
  };
  this.getPolls = function() {
    return this.polls;
  };
  this.getQueries = function() {
    return this.queries;
  };
  this.getProposals = function() {
    return this.proposals;
  };
});

app.controller("homeController", function(
  $scope,
  $state,
  online,
  cloudioServer,
  boffoDataService
) {
  $scope.myData = "Boffo";

  online.getStatus().then(function(res) {
    console.log("***" + res);
  });
  $scope.menuEnabled = false;
  $scope.addOptionsEnabled = false;
  $scope.toggleMenu = function() {
    $scope.menuEnabled = !$scope.menuEnabled;
  };

  $scope.setAddOptionsEnabled = function(val) {
    $scope.addOptionsEnabled = val;
  };

  $scope.additemOptions = ["Event", "Poll", "Proposal", "Query"];

  $scope.menuOptions = [
    { icon: "local_activity", name: "Events" ,styleClass: "title-event"},
    { icon: "thumbs_up_down", name: "Polls" ,styleClass: "title-poll"},
    { icon: "help_outline", name: "Queries" ,styleClass: "title-query"},
    { icon: "pan_tool", name: "Proposals" ,styleClass: "title-proposal"},
    // { icon: "person", name: "Account" }
  ];

  $scope.addItemClick = function(val) {
    switch (val) {
      case "Event":
        $scope.menuEnabled = false;
        $scope.setAddOptionsEnabled(false);
        $state.go("add-event");
        break;
      case "Poll":
        $scope.menuEnabled = false;
        $scope.setAddOptionsEnabled(false);
        $state.go("add-poll");
        break;
      case "Query":
        $scope.menuEnabled = false;
        $scope.setAddOptionsEnabled(false);
        $state.go("add-query");
        break;
      case "Proposal":
        $scope.menuEnabled = false;
        $scope.setAddOptionsEnabled(false);
        $state.go("add-proposal");
        break;
    }
  };
  $scope.menuItemClickOption = function(val) {
    switch (val) {
      case "Home":
        $scope.menuEnabled = false;
        $scope.getSession();
        $state.go("home");
        break;
      case "Events":
        $scope.menuEnabled = false;
        $state.go("events");
        break;
      case "Polls":
        $scope.menuEnabled = false;
        $state.go("polls");
        break;
      case "Queries":
        $scope.menuEnabled = false;
        $state.go("query");
        break;
      case "Proposals":
        $scope.menuEnabled = false;
        $state.go("proposal");
        break;
      case "Account":
        $scope.menuEnabled = false;
        $state.go("account");
        break;
    }
  };

  $scope.getSession = function() {
    cloudioServer.getSession().then(function(res) {
      console.log("CloudIO Session Result | " + res);
    });
  };



  $scope.loadRecentEvents = function(){
      $scope.homeEvents = boffoDataService.getEvents();
  };

  $scope.loadRecentPolls = function(){
      $scope.homePolls = boffoDataService.getPolls();
  };

  $scope.loadRecentProposals= function(){
      $scope.homeProposals = boffoDataService.getProposals();
  };

  $scope.loadRecentQueries= function(){
      $scope.homeQueries = boffoDataService.getQueries();
  };

  $scope.init = function() {
    $scope.loadRecentEvents();
    $scope.loadRecentPolls();
    $scope.loadRecentProposals();
    $scope.loadRecentQueries();
  };

  $scope.init();
});

app.controller("createEventController", function($scope) {
  $scope.eventName = "Please Type";
});

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state("home", {
      url: "/",
      templateUrl: "/templates/homeDetail.html"
    })
    .state("events", {
      url: "/events",
      templateUrl: "/templates/eventDetail.html"
    })
    .state("polls", {
      url: "/polls",
      templateUrl: "/templates/pollDetail.html"
    })
    .state("query", {
      url: "/query",
      templateUrl: "/templates/queryDetail.html"
    })
    .state("proposal", {
      url: "/proposal",
      templateUrl: "/templates/proposalDetail.html"
    })
    .state("add-event", {
      url: "/new-event",
      templateUrl: "/templates/createEvent.html"
    })
    .state("add-poll", {
      url: "/new-poll",
      templateUrl: "/templates/createPoll.html"
    })
    .state("add-query", {
      url: "/new-query",
      templateUrl: "/templates/createQuery.html"
    })
    .state("add-proposal", {
      url: "/new-proposal",
      templateUrl: "/templates/createProposal.html"
    })
    .state("account", {
      url: "/account",
      templateUrl: "/templates/accountDetail.html"
    });
});

app.directive("bInput", function() {
  var directive = {};
  directive.scope = {
    label: "="
  };
  directive.templateUrl = "/templates/dirInput.html";
  directive.link = function(scope, elem, attrs) {
    console.log("***" + scope.label);
  };

  return directive;
});
