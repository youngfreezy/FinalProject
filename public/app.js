  // // TODO: replace ngCookies strategy with another authentication strategy.
  // angular.run(document).ready();
  angular.module('MyApp', ['ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap', 'ngCookies', 'ngAnimate'])
    .run(function ($cookies, $rootScope, ioService, $location) {
      //Fixing facebook bug with redirect 
      if (window.location.hash === '#_=_') {
        window.location.hash = '#!';
      }


      var user = $cookies.user;

      if (user) {
        console.log(user);
        user = JSON.parse(user);
      }
      $rootScope.currentUser = user;
      console.log("User from angular cookie is: ", user);
      //  console.log('facebook info is ', user);
      ioService.start(io, user);

      // // $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      // //   var oldUrlForPath = $location.url(oldUrl);
      // //   event.preventDefault();
      // //   console.log(oldUrlForPath);
      // // });
      // var history = [];
      // $rootScope.$on('$locationChangeSuccess', function () {
      //   history.push($location.$$path);
      // });

      // console.log(history);

      // $rootScope.back = function () {
      //   var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
      //   $location.path(prevUrl);
      //   history = []; //Delete history array after going back
      // };
      if($location.path()){

       $rootScope.loginDestination = $location.path();
      } else {
        $rootScope.loginDestination = '/#!';
      }
    

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

    });