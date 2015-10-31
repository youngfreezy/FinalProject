  // // TODO: replace ngCookies strategy with another authentication strategy.
  // angular.run(document).ready();
  angular.module('MyApp', ['ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap', 'ngCookies', 'ngAnimate'])
    .run(function ($cookies, $rootScope, ioService, $location) {
      //Fixing facebook bug with redirect 
      if (window.location.hash === '#_=_') {
        window.location.hash = '#!';
      }



      $rootScope.timestamp = (new Date()).getTime();
      var user = $cookies.user;

      if (user) {
        // console.log(user);
        user = JSON.parse(user);
      }
      $rootScope.currentUser = user;
      // console.log("User from angular cookie is: ", user);
      //  console.log('facebook info is ', user);
      ioService.start(io, user);

      $rootScope.$on('$locationChangeStart', function (evt, absNewUrl, absOldUrl) {
        var hashIndex = absOldUrl.indexOf('#!');

        var oldRoute = absOldUrl.substr(hashIndex + 3);
        if(oldRoute[oldRoute.length-1] !== "/" && oldRoute.indexOf("login") === -1 && oldRoute.indexOf("signup") === -1) {

        $rootScope.previousPage = oldRoute;
        }

      });

      console.log($rootScope.previousPage);

    })
    .config(function ($locationProvider, $routeProvider) {
      //get rid of #:
      $locationProvider.html5Mode(false).hashPrefix('!');




      $routeProvider
        .when('/', {
          templateUrl: 'views/home.html',
          controller: 'MainCtrl'
        })


      .when('/stream/', {
        templateUrl: 'views/stream.html',
        controller: 'StreamCtrl'
      })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/signup', {
          templateUrl: 'views/signup.html',
          controller: 'SignupCtrl'
        })
        .when('/profile', {
          templateUrl: 'views/profile.html',
          controller: 'ProfileCtrl'
        })

      .when('/add', {
        templateUrl: 'views/add.html',
        controller: 'MainCtrl'
      })
        .when('/recipe/:id', {
          templateUrl: 'views/recipe.html',
          controller: 'RecipeCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });

    }).config(function ($httpProvider) {
      $httpProvider.interceptors.push(function ($q) {

        return {
          request: function (request) {
            // console.log("hello");
            // console.log(window.location.href);
            request.headers.lastUrl = window.location.href;
            return request;
          },
          responseError: function (response) {
            return $q.reject(response);
          }
        };
      });
    })