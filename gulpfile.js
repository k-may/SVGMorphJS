var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');

var src = [
	"src/SVGMorph.js",
	"src/Morph.js",
	"src/Shape.js",
	"src/Segment.js",
	"src/MorphSegment.js",
	"src/MorphableGroup.js",
	"src/MorphableParallelGroup.js",
	"src/Path.js",
	"src/BoundingBox.js",
	"src/PathUtils.js",
	"src/GeomUtils.js",
	"src/LoadUtils.js",
	"src/CanvasUtils.js",
	"src/SVGMorphDrawer.js"
];

var srcGlob = "./src/**/*";
// Transpile, concatenate and minify scripts
function scripts_min() {
	return (
		gulp
			.src(src)
			.pipe(uglify())
			.pipe(concat('SVGMorph.min.js'))
			.pipe(gulp.dest('dist'))
	);
}

// Transpile, concatenate and minify scripts
function scripts() {
	return (
		gulp
			.src(src)
			.pipe(concat('SVGMorph.js'))
			.pipe(gulp.dest('dist'))
	);
}
// Watch files
function watchFiles() {
	gulp.watch(srcGlob, scripts);
}

const watch = gulp.series(watchFiles);
const js = gulp.series(scripts, scripts_min);

exports.watch = watch;
exports.default = js;
