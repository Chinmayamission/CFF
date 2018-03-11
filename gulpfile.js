var gulp = require('gulp');
var shell = require('gulp-shell');
var typescript = require('gulp-tsc');
var connect = require('gulp-connect');

gulp.task('serve', ['default', 'webserver']);

gulp.task('default', ['FormPage-js']);

gulp.task('webserver', function() {
    connect.server({
        port: 8000,
        root: "."
    });
});

const DJANGO_ROOT_URL = "./htdocs/cff";
const FORMBUILDER_URL = "./htdocs/cff/gcmw/forms/formBuilder";
const inputFiles = FORMBUILDER_URL + '/assets/ts/**/*.tsx';

gulp.task('FormPage-js', shell.task([
        'webpack --watch'
    ]));

gulp.task('FormPage-js-build', function() {
    return null;
    return gulp.src(inputFiles)
    .pipe(typescript({
        target: "ES6",
        additionalTscParameters: ['--jsx', 'react']
    }))
    .pipe(gulp.dest(FORMBUILDER_URL + '/assets/bundles/'));
});