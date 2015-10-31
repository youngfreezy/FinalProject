module.exports = function (config) {
  config.set({

    basePath: '../',

    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'vendor/angular.js',
      'vendor/*.js',
      'app.js',
      'services/*.js',
      'controllers/*.js',
      'test/unit/*.js'
    ],

    autoWatch: true,

    frameworks: ['mocha', 'chai', 'jasmine'],

    browsers: ['PhantomJS'],

    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-mocha',
      'karma-chai'
    ]
  });
};