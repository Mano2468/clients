(function() {
      'use strict';
      angular.module("App").config(function(socialProvider) {
          socialProvider.setGoogleKey("852719941005-ih7metpp0034vknc0bv846q1elrd1r7r.apps.googleusercontent.com");
          socialProvider.setFbKey({ appId: '581389282056584', apiVersion: 'v2.8' });
      });
  }());