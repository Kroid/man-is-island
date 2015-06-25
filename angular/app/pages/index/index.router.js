(function () {
  'use strict';

  angular.module('app').config(config);

  config.$inject = ['$routeProvider'];

  function config($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: '/pages/index/index.html',
      controller: 'IndexCtrl',
      controllerAs: 'vm',
      title: 'Index'
    });
  }
})();