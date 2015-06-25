(function() {
  'use strict';

  angular.module('app').controller('IndexCtrl', ctrl);

  ctrl.$inject = ['$http', 'growl'];

  function ctrl($http, growl) {
    var vm = this;
  }
})();
