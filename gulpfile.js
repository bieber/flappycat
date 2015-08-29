/*
 * Copyright 2015, Robert Bieber
 *
 * This file is part of flappycat.
 *
 * flappycat is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * flappycat is distributed in the hope that it will be useful,
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with flappycat.  If not, see <http://www.gnu.org/licenses/>.
 */

var babelify = require('babelify');
var browserify = require('browserify');
var fs = require('fs');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

var NODE_ENV = require('node-env');

gulp.task('build', function() {
	browserify({debug: NODE_ENV !== 'production'})
		.transform(babelify)
		.require('./src/js/init.js', {expose: 'init'})
		.bundle()
		.on('error', util.log)
		.pipe(source('init.js'))
		.pipe(gulpif(NODE_ENV === 'production', streamify(uglify())))
		.pipe(gulp.dest('./build/'));

	gulp.src('./src/*.html')
		.pipe(gulp.dest('./build/'));

	gulp.src('./src/*.css')
		.pipe(gulp.dest('./build/'))
});

gulp.task('watch', function() {
	gulp.watch('./src/**/*', ['build']);
});

gulp.task('default', ['build', 'watch']);
