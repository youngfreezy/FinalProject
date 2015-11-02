module.exports = function (config) {
  config.set({

    basePath: '../',

    files: [
      'vendor/angular.js',
      'vender/angular-mocks.js',
      '../node_modules/socket.io-client/socket.io.js',
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