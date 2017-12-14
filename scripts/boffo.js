var app = angular.module("boffo", ["ui.router", "bpwa"]);

app.service("boffoDataService", function() {
  this.events = [
    {
      name: "New Year Celebrations",
      description:
        "Fun filled event to welcome and celebrate the new year with office collegues",
      members: "CloudIO India",
      date: new Date()
    },
    {
      name: "#PSPK25 Movie FDFS",
      description: "FDFS of #PSPK25",
      members: "Ravi, Subodh",
      date: new Date()
    },
    {
      name: "Christmas Celebrations",
      description: "Fun filled event to celebrate Christmas",
      members: "CloudIO India",
      date: new Date()
    }
  ];
  this.polls = [
    {
      name: "Which is more stable 2.3 vs 2.4",
      options: ["GWT", "Angular", "React"],
      optionsCount: [5, 13, 2]
    },
    {
      name: "Evening snacks in Pantry?",
      options: ["Yes", "No"],
      optionsCount: [0, 0]
    }
  ];
  this.queries = [{ name: "query1" }, { name: "query2" }, { name: "query3" }];
  this.proposals = [
    {
      name: "Can we every last friday of the Month as POTLUCK friday?",
      options: ["Agree", "Disagree", "Cant Say"],
      optionsCount: [3, 2, 1]
    }
  ];

  this.eventComments = [{ user: "Subodh Kumar", comment: "Cool...!" }];
  this.pollComments = [{ user: "Subodh Kumar", comment: "Nice Poll...!" }];
  this.queryComments = [
    { user: "Subodh Kumar", comment: "Cool...!" }
  ];
  this.proposalComments = [
    { user: "Subodh Kumar", comment: "Yeah can be done" }
  ];

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

  this.getEventComments = function() {
    return this.eventComments;
  };
  this.getPollComments = function() {
    return this.pollComments;
  };
  this.getQueryComments = function() {
    return this.queryComments;
  };
  this.getProposalComments = function() {
    return this.proposalComments;
  };

  this.addComment = function(category, comment) {
    var comment = { user: "Subodh Kumar", comment: comment };
    switch (category) {
      case "event":
        this.eventComments.push(comment);
        break;
      case "poll":
        this.pollComments.push(comment);
        break;
      case "proposal":
        this.proposalComments.push(comment);
        break;
      case "query":
        this.queryComments.push(comment);
        break;
    }
  };
  this.addEvent = function(val) {
    this.events.push(val);
  };
  this.addPoll = function(val) {
    this.polls.push(val);
  };
  this.addQuery = function(val) {
    this.queries.push(val);
  };
  this.addProposal = function(val) {
    this.proposals.push(val);
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
  $scope.selectedCard = null;
  $scope.homePageFilter = "none";

  $scope.eventComment = "";

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
    { icon: "local_activity", name: "Events", styleClass: "title-event" },
    { icon: "thumbs_up_down", name: "Polls", styleClass: "title-poll" },
    { icon: "help_outline", name: "Queries", styleClass: "title-query" },
    { icon: "pan_tool", name: "Proposals", styleClass: "title-proposal" }
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
        $scope.resetHomePageFilter();
        break;
      case "Events":
        $scope.menuEnabled = false;
        // $state.go("events");
        $scope.setHomePageFilter("event");
        break;
      case "Polls":
        $scope.menuEnabled = false;
        $state.go("home");
        // $state.go("polls");
        $scope.setHomePageFilter("poll");
        break;
      case "Queries":
        $scope.menuEnabled = false;
        $state.go("home");
        // $state.go("query");
        $scope.setHomePageFilter("query");
        break;
      case "Proposals":
        $scope.menuEnabled = false;
        $state.go("home");
        // $state.go("proposal");
        $scope.setHomePageFilter("proposal");
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

  $scope.setSelectedCard = function(card, close) {
    if (close) {
      $scope.selectedCard = null;
    } else if ($scope.selectedCard && $scope.selectedCard === card) {
    } else if (card) {
      $scope.selectedCard = card;
      $scope.eventComments = boffoDataService.getEventComments();
      $scope.pollComments = boffoDataService.getPollComments();
      $scope.queryComments = boffoDataService.getQueryComments();
      $scope.proposalComments = boffoDataService.getProposalComments();
    }
  };

  $scope.setHomePageFilter = function(val) {
    $scope.homePageFilter = val;
  };
  $scope.resetHomePageFilter = function(val) {
    $scope.homePageFilter = "none";
  };

  $scope.addComment = function(category, comment) {
    boffoDataService.addComment(category, comment);
    $scope.eventComment = "";
    boffoDataService.getEventComments();
  };

  $scope.loadRecentEvents = function() {
    $scope.homeEvents = boffoDataService.getEvents();
  };

  $scope.loadRecentPolls = function() {
    $scope.homePolls = boffoDataService.getPolls();
  };

  $scope.loadRecentProposals = function() {
    $scope.homeProposals = boffoDataService.getProposals();
  };

  $scope.loadRecentQueries = function() {
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

app.controller("createEventController", function($scope, boffoDataService) {
  $scope.eventName = "Please Type";
  $scope.newEvent = { name: "Subodh Kumar" };

  $scope.addEvent = function() {
    boffoDataService.addEvent(angular.copy($scope.newEvent));
    $scope.newEvent = {};
  };
  $scope.cancelEvent = function() {
    $scope.newEvent = {};
  };
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
    label: "=",
    ngModel: "="
  };
  directive.templateUrl = "/templates/dirInput.html";
  directive.link = function(scope, elem, attrs) {
    console.log("***" + scope.label + " ***" + scope.ngModel);
  };

  return directive;
});
