module.exports = {
  concat: {
    'dist/js/shim.js': [
      'src/js/lib/shim/es5-sham.min.js',
      'src/js/lib/shim/es5-shim.min.js',
      'src/js/lib/shim/es6-sham.min.js',
      'src/js/lib/shim/es6-shim.min.js',
      'src/js/lib/shim/json3.min.js'
    ]
  },
  commit: {
    hostname: '//www.testhost.com',
    mainHost: 'http://www.testhost.com'
  }

}