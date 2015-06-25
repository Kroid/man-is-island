(function () {
  'use strict';

  angular.module('app').config(config);

  config.$inject = ['$routeProvider'];

  function config($routeProvider) {
    $routeProvider.when('/login', {
      templateUrl: '/pages/login/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'vm',
      title: 'Login'
    });
  }
})();