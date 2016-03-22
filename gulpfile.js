var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

gulp.task('js', function () {
	return gulp.src('src/**/*.js')
		.pipe(uglify())
		.pipe(concat('SVGMorph.min.js'))
		.pipe(gulp.dest('dist'))
		.pipe(notify({ message: 'Finished minifying JavaScript'}));
});

gulp.task('default', function () {
	gulp.run('js');

	gulp.watch('*/*.js', function () {
		gulp.run('js');
	});
});