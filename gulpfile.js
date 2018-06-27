var gulp = require('gulp');
var shell = require('gulp-shell');
var typescript = require('gulp-tsc');
var connect = require('gulp-connect');
var pjson = require("./package.json");

gulp.task('serve', ['dev', 'webserver']);

gulp.task('dev', ['FormPage-js']);

gulp.task('webserver', function() {
    connect.server({
        port: 8000,
        // If this doesn't work on Windows, disable the "Web Deployment Agent Service"
        // Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
        root: "./scripts/dist",
        livereload: true,
        fallback: `./scripts/dist/index.${pjson.version}.html`
    });
});

gulp.task('webserver-prod', function() {
    connect.server({
        port: 8000,
        root: "./scripts/prod",
        livereload: true,
        fallback: `./scripts/prod/index.${pjson.version}.html`
    });
});


gulp.task('FormPage-js', shell.task([
    'webpack --progress --watch --config webpack.dev.js'
]));