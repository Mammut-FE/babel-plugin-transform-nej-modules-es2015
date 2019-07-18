const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const tsc = require('gulp-typescript');

const tsProject = tsc.createProject('./src/tsconfig.dev.json');

gulp.task('clean', function () {
    return gulp.src(['base', 'ui', 'util', 'dist'], {read: false, allowEmpty: true})
        .pipe(clean());
});

gulp.task('build:lib', function () {
    return gulp.src('src/nejRoot/**/*.js')
        .pipe(babel({
            plugins: [
                [path.join(__dirname, './dist/nej2common.js'), {
                    nejRoot: path.join(__dirname, './src/nejRoot')
                }]
            ]
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('build:code', function () {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series(['clean', 'build:code', 'build:lib']));
