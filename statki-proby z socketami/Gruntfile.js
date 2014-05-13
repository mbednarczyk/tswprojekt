module.exports = function(grunt) {
    "use strict";
    grunt.loadNpmTasks('grunt-bower-task');

    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: './lib',
                    layout: 'byType',
                    install: true,
                    verbose: true,
                    cleanTargetDir: false,
                    cleanBowerDir: false
                }
            }
        }
    });
    grunt.registerTask('default', ['bower:install']);
}
