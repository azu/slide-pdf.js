module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner:
                '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>;\n' +
                ' * Licensed under the <%= _.pluck(pkg.licenses, "type").join(", ") %> license */\n\n'
        },
        concat: {
            options: {
                separator: '\n\n'
            },
            build: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [
                    'src/fingers.prefix',
                    'src/module.js',
                    'src/Utils.js',
                    'src/CacheArray.js',
                    'src/Instance.js',
                    'src/Finger.js',
                    'src/FingerUtils.js',
                    'src/Gesture.js',
                    'src/gestures/module.js',
                    'src/gestures/Drag.js',
                    'src/gestures/Hold.js',
                    'src/gestures/Pinch.js',
                    'src/gestures/Raw.js',
                    'src/gestures/Swipe.js',
                    'src/gestures/Tap.js',
                    'src/gestures/Transform.js',
                    'src/gestures/ZoneHover.js',
                    'src/export.js',
                    'src/fingers.suffix'],
                dest: 'fingers.js'
            }
        },
        uglify: {
            options: {
                report: 'gzip',
                sourceMap: 'fingers.min.map',
                banner: '<%= meta.banner %>'
            },
            build: {
                files: {
                    'fingers.min.js': ['fingers.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            build: {
                src: ['fingers.js']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'test']);
    grunt.registerTask('test', ['jshint']);
};