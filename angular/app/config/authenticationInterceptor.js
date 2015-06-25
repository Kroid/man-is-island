(function() {
  'use strict';

  angular
    .module('app')
    .config(provider)
    .factory('authenticationInterceptor', interceptor);


  provider.$inject = ['$httpProvider'];

  function provider($httpProvider) {
    $httpProvider.interceptors.push('authenticationInterceptor');
  }


  interceptor.$inject = ['$location', '$q', 'growl', 'session'];

  function interceptor($location, $q, growl, session) {
    return {
      request: function(data) {
        var token = session.token;

        if (token) {
          data.headers['X-Authentication-Token'] = token;
        }

        return data;
      },
      responseError: function(err) {
        switch (err.status) {
          case 401:
            session.clearToken();
            $location.path('/login');
            growl.warning('Вы не авторизированы.')
          case 500:
            growl.error('Произошла ошибка сервера.')
        }

        return $q.reject(err);
      }
    };
  }

})();