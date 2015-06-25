(function() {
  'use strict';

  angular.module('app').controller('LoginCtrl', ctrl);

  ctrl.$inject = ['$http', '$location', 'growl', 'session'];

  function ctrl($http, $location, growl, session) {
    var vm = this;

    vm.login = null;
    vm.password = null;

    vm.authorize = authorize;


    function authorize() {
      $http
      .post('/api/sessions.json', {
        login: vm.login,
        password: vm.password
      })
      .success(function(resp) {
        session.setToken(resp.authentication_token);
        $location.path('/');
      })
      .error(function(err) {
        session.clearToken();
        growl.error('Authorization failed.')
      });
    }
  }

})();