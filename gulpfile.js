var gulp = require('gulp');
var shell = require('gulp-shell');
var typescript = require('gulp-tsc');

gulp.task('default', ['FormPage-js']);

const DJANGO_ROOT_URL = "./htdocs/cff";
const FORMBUILDER_URL = "./htdocs/cff/gcmw/forms/formBuilder";
const inputFiles = FORMBUILDER_URL + '/assets/ts/**/*.tsx';

gulp.task('FormPage-js', shell.task([
        'webpack --watch'
    ]));
    gulp.task('archive', shell.task([
        'git archive --format=zip HEAD -o 1.0.9.zip'
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