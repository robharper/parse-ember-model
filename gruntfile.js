module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      full: {
        dest: 'dist/parse-ember-model.js',
        src: [
          'src/parse-adapter.js',
          'src/parse-model.js',
          'src/parse-user.js',
          'src/parse-pointer-attr.js'
        ]
      }
    },

    connect: {
      server: {
        options: {
          port: 9000,
          keepalive: true,
          middleware: function(connect, options) {
            return [
              // Serve static files.
              connect.static('src'),
              connect.static('test'),
              connect.static('examples'),
              connect.static('bower_components')
            ];
          }
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};