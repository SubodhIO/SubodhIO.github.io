var app = angular.module("boffo",['ui.router','bpwa']);

app.controller("homeController",function($scope,$state,online,cloudioServer){
    $scope.myData = 'Boffo';

    online.getStatus().then(function(res){
        console.log('***'+res);
    });
    $scope.menuEnabled = false;
    $scope.addOptionsEnabled = false;
    $scope.toggleMenu = function(){
        $scope.menuEnabled = !$scope.menuEnabled;
    };

    $scope.setAddOptionsEnabled = function(val){
        $scope.addOptionsEnabled = val;
    };

    $scope.additemOptions = ['Event','Poll','Proposal','Query'];

    $scope.menuOptions = [
        {icon:'local_activity',name:'Events'},
        {icon:'thumbs_up_down',name:'Polls'},
        {icon:'help_outline',name:'Queries'},
        {icon:'pan_tool',name:'Proposals'},
        {icon:'person',name:'Account'}
    ];

    $scope.addItemClick = function(val){
        switch(val){
            case 'Event': $scope.menuEnabled = false;$scope.setAddOptionsEnabled(false);$state.go('add-event'); break;
            case 'Poll': $scope.menuEnabled = false;$scope.setAddOptionsEnabled(false);$state.go('add-poll');break;
            case 'Query': $scope.menuEnabled = false;$scope.setAddOptionsEnabled(false);$state.go('add-query');break;
            case 'Proposal': $scope.menuEnabled = false;$scope.setAddOptionsEnabled(false);$state.go('add-proposal');break;
        }
    }
    $scope.menuItemClickOption = function(val){
        switch(val){
            case 'Home': $scope.menuEnabled = false;$scope.getSession();$state.go('home'); break;
            case 'Events': $scope.menuEnabled = false;$state.go('events'); break;
            case 'Polls': $scope.menuEnabled = false;$state.go('polls');break;
            case 'Queries': $scope.menuEnabled = false;$state.go('query');break;
            case 'Proposals': $scope.menuEnabled = false;$state.go('proposal');break;
            case 'Account': $scope.menuEnabled = false;$state.go('account'); break;
        }
    }

    $scope.getSession = function(){
        cloudioServer.getSession().then(function(res){
            console.log('CloudIO Session Result | '+res);
        });
    }
});

app.controller('createEventController',function($scope){
        $scope.eventName = 'Please Type';
    });

app.config(function($stateProvider,$urlRouterProvider){

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home',{
        url:'/',
        templateUrl:'/templates/homeDetail.html'
    })
    .state('events',{
        url:'/events',
        templateUrl:'/templates/eventDetail.html'
    })
    .state('polls',{
        url:'/polls',
        templateUrl:'/templates/pollDetail.html'
    })
    .state('query',{
        url:'/query',
        templateUrl:'/templates/queryDetail.html'
    })
    .state('proposal',{
        url:'/proposal',
        templateUrl:'/templates/proposalDetail.html'
    })
    .state('add-event',{
        url:'/new-event',
        templateUrl:'/templates/createEvent.html'
    })
    .state('add-poll',{
        url:'/new-poll',
        templateUrl:'/templates/createPoll.html'
    })
    .state('add-query',{
        url:'/new-query',
        templateUrl:'/templates/createQuery.html'
    })
    .state('add-proposal',{
        url:'/new-proposal',
        templateUrl:'/templates/createProposal.html'
    })
    .state('account',{
        url:'/account',
        templateUrl:'/templates/accountDetail.html'
    });

});



app.directive('bInput',function(){

    var directive = {};
    directive.scope = {
        label:'='
    }
     directive.templateUrl = '/templates/dirInput.html';
   directive.link = function(scope,elem,attrs){
       console.log('***'+scope.label);
   }
   
    return directive;

});