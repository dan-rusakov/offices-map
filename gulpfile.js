var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleancss       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		autoprefixer   = require('gulp-autoprefixer'),
		notify         = require("gulp-notify"),
		imagemin       = require('gulp-imagemin'),
		svgstore 			 = require('gulp-svgstore'),
		svgmin 				 = require('gulp-svgmin'),
		path 					 = require('path'),
		del            = require('del');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		open: false,
		// online: false, // Offline work
		//tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	});
});

gulp.task('js', function() {
	return gulp.src([
		'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Minimize js
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Comment when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream());
});

gulp.task('svgstore', function () {
	return gulp.src('app/icons/*.svg')
	.pipe(svgmin(function (file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
					plugins: [{
							cleanupIDs: {
									prefix: prefix + '-',
									minify: true
							}
					}]
			}
	}))
	.pipe(svgstore())
	.pipe(gulp.dest('app/img/'));
});

gulp.task('watch', function() {
	gulp.watch('app/sass/**/*.sass', gulp.parallel('sass'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('js'));
	gulp.watch('app/*.html').on('change', browserSync.reload);
	gulp.watch('app/icons/*.svg', gulp.parallel('svgstore'));
});

gulp.task('default', gulp.parallel('sass', 'js', 'browser-sync', 'watch'));

gulp.task('clean', function() {
  return del(['dist']);
});

gulp.task('compress', function() {
  return gulp.src('app/img/**/*')
  .pipe(imagemin({
    interlaced: true,
    progressive: true,
    optimizationLevel: 5
	}))
  .pipe(gulp.dest('dist/img'))
});

gulp.task('buildCss', function(){
	return gulp.src('app/css/main.min.css')
  .pipe(gulp.dest('dist/css'));
});

gulp.task('buildFonts', function(){
	return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'));
});

gulp.task('buildJs', function(){
	return gulp.src('app/js/scripts.min.js')
  .pipe(gulp.dest('dist/js'));
});

gulp.task('buildHtml', function(){
	return gulp.src('app/*.html')
  .pipe(gulp.dest('dist'));
});

gulp.task('buildData', function(){
	return gulp.src('app/*.json')
  .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series(
	'clean',
	'compress',
	gulp.parallel('sass', 'js', 'buildCss', 'buildFonts', 'buildJs', 'buildHtml', 'buildData')
));