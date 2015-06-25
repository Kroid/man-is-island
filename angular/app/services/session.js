(function() {
  angular.module('app').service('session', service);

  service.$inject = ['localStorageService', 'uuid'];

  function service(localStorageService, uuid) {
    var self = this;

    this.platform = 'browser';
    this.token = localStorageService.get('token');
    this.uuid  = localStorageService.get('uuid');

    if (!this.uuid) {
      this.uuid = uuid();
      localStorageService.set('uuid', this.uuid);
    }

    this.clearToken = clearToken;
    this.isAuthorized = isAuthorized;
    this.setToken = setToken;


    function isAuthorized() {
      return !!self.token
    }

    function setToken(token) {
      self.token = token;
      localStorageService.set('token', self.token)
    }

    function clearToken() {
      delete self.token;
      localStorageService.remove('token');
    }
  }

})();