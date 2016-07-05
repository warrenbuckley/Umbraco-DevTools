var gulp = require('gulp');
var ts = require('gulp-typescript');


gulp.task('scripts', function() {
    var tsResult = gulp.src('src/scripts/**/*.ts')
        .pipe(ts({
            declaration: false,
            noExternalResolve: true
        }));
 
    return tsResult.js.pipe(gulp.dest('dist/scripts'));
});

//copy static folders to build directory
gulp.task('copy', function() {

	gulp.src('src/images/**').pipe(gulp.dest('dist/images'));
    gulp.src('src/views/**').pipe(gulp.dest('dist/views'));
	return gulp.src('src/manifest.json').pipe(gulp.dest('dist'));

});

// Rerun the task when a file changes
gulp.task('watch', function() {

  gulp.watch('src/images/**', ['copy']);
  gulp.watch('src/views/**', ['copy']);
  gulp.watch('src/manifest.json', ['copy']);
  gulp.watch('src/scripts/**/*.ts', ['scripts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['copy', 'scripts', 'watch']);