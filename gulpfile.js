var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');

var src = [
	"src/Morph.js",
	"src/MorphableGroup.js",
	"src/MorphableParallelGroup.js",
	"src/SVGMorphSequencer.js",
	"src/SVGMorphPath.js",
	"src/SVGMorphDrawer.js",
	"src/Utils.js"
];

gulp.task('js-min', function () {
	return gulp.src(src)//'src/**/*.js')
		.pipe(uglify())
		.pipe(concat('SVGMorph.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('js', function () {
	return gulp.src(src)//'src/**/*.js')
		.pipe(concat('SVGMorph.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('default', function () {
	gulp.run(['js', 'js-min']);

	gulp.watch('*/*.js', function () {
		gulp.run(['js', 'js-min']);
	});
});