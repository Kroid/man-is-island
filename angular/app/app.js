(function() {
  'use strict';

  angular
    .module('app', [
      'ngRoute',
      'LocalStorageModule',
      'kroid-uuid',
      'angular-growl'
    ])
    .config(config)
    .run(run);


  config.$inject = ['$locationProvider', '$routeProvider'];

  function config($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.otherwise('/')
  }

  run.$inject = ['$rootScope', '$location', 'session'];

  function run($rootScope, $location, session) {
    $rootScope.$on('$routeChangeStart', function(q) {
      if (!session.isAuthorized()) {
        $location.path('/login');
      }
    })
  }

})();