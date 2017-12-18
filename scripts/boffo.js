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
      name: "Which platform variant is more easy to develop",
      options: [
        { label: "GWT", count: 5 },
        { label: "Angular", count: 10 },
        { label: "React", count: 5 }
      ]
    },
    {
      name: "Evening snacks in Pantry?",
      options: [{ label: "Yes", count: 5 }, { label: "No", count: 10 }]
    }
  ];
  this.queries = [
    { name: "Which is the best word process for MacOS" },
    { name: "Where do we find the platform tutorial videos?" },
    { name: "Can someone helpme with the best Veg restaurants nearby?" }
  ];
  this.proposals = [
    {
      name: "Can we every last friday of the Month as POTLUCK friday?",
      options: [
        { label: "Agree", count: 4 },
        { label: "Disagree", count: 3 },
        { label: "Cant Say", count: 5 }
      ]
    }
  ];

  this.eventComments = [{ user: "Lakshmi Dharani", comment: "Cool...!" }];
  this.pollComments = [{ user: "Sai Sidhartha", comment: "Nice Poll...!" }];
  this.queryComments = [{ user: "Anusha", comment: "Cool...!" }];
  this.proposalComments = [{ user: "Raviteja", comment: "Yeah can be done" }];

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
        $state.go("home");
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

app.controller("createPollController", function(
  $scope,
  $http,
  $state,
  boffoDataService
) {
  $scope.newPoll = { name: "", optionStr: "" };

  $scope.addPoll = function() {
    var ops = $scope.newPoll.optionStr.split(",");
    $scope.newPoll.options = [];
    for (var i = 0; i < ops.length; i++) {
      var newObj = { label: ops[i], count: 0 };
      $scope.newPoll.options.push(newObj);
    }

    boffoDataService.addPoll(angular.copy($scope.newPoll));
    $scope.newPoll = { name: "", optionStr: "" };
    $state.go("home");
    $http
      .get("http://boffoserver.herokuapp.com/api/notification/new-poll")
      .then(function(res) {
        console.log("Notification Sent");
      });
  };
  $scope.cancelPoll = function() {
    $scope.newPoll = { name: "", optionStr: "" };
    $state.go("home");
  };
});

app.controller("createProposalController", function(
  $scope,
  $state,
  $http,
  boffoDataService
) {
  $scope.newProposal = { name: "", optionStr: "" };

  $scope.addProposal = function() {
    var ops = $scope.newProposal.optionStr.split(",");
    $scope.newProposal.options = [];
    for (var i = 0; i < ops.length; i++) {
      var newObj = { label: ops[i], count: 0 };
      $scope.newProposal.options.push(newObj);
    }

    boffoDataService.addProposal(angular.copy($scope.newProposal));
    $scope.newProposal = { name: "", optionStr: "" };
    $state.go("home");
    $http
      .get("http://boffoserver.herokuapp.com/api/notification/new-proposal")
      .then(function(res) {
        console.log("Notification Sent");
      });
  };
  $scope.cancelProposal = function() {
    $scope.newProposal = { name: "", optionStr: "" };
    $state.go("home");
  };
});

app.controller("createQueryController", function(
  $scope,
  $state,
  $http,
  boffoDataService
) {
  $scope.newQuery = { name: "" };

  $scope.addQuery = function() {
    boffoDataService.addQuery(angular.copy($scope.newQuery));
    $scope.newQuery = {};
    $state.go("home");
    $http
      .get("http://boffoserver.herokuapp.com/api/notification/new-query")
      .then(function(res) {
        console.log("Notification Sent");
      });
  };
  $scope.cancelQuery = function() {
    $scope.newQuery = { name: "" };
    $state.go("home");
  };
});

app.controller("createEventController", function(
  $scope,
  $state,
  $http,
  boffoDataService
) {
  $scope.eventName = "Please Type";
  $scope.newEvent = { name: "" };

  $scope.addEvent = function() {
    boffoDataService.addEvent(angular.copy($scope.newEvent));
    $scope.newEvent = {};
    $state.go("home");
    $http
      .get("http://boffoserver.herokuapp.com/api/notification/new-event")
      .then(function(res) {
        console.log("Notification Sent");
      });
  };
  $scope.cancelEvent = function() {
    $scope.newEvent = {};
    $state.go("home");
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
