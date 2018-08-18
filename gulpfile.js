/*--------------------------------------------------------------
*
* author: wangpeng、yanzhichao 
* editTime: 2018/08/18 18:41
*
----------------------------------------------------------------*/

// dev
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'); // sass hot

// build
var uglify = require('gulp-uglify'),
    useref = require('gulp-useref');
var gutil = require('gulp-util'); // js
var gulpIf = require('gulp-if'),
    cssnano = require('gulp-cssnano'),
    minifyCSS = require('gulp-minify-css'); // css
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'); // img
var del = require('del'); // removefile
var runSequence = require('run-sequence'); // task

/*--------------------------------
*
* dev cmd: gulp dev
*
--------------------------------*/

// 浏览器热替换
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
    })
});

// 编译sass 
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

// 监听者
gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
})

// 任务执行 开发模式
gulp.task('dev', function(callback) {
    runSequence(['sass', 'browserSync', 'watch'],
        callback
    )
})


/*--------------------------------
*
* prod cmd: gulp build
*
--------------------------------*/

// 压缩合并css js
gulp.task('useref', function() {
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
});

// 优化图片
gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
});

// 复制字体
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
})

// 清理文件: 自动生成文件，我们不想旧文件掺杂进来
gulp.task('clean', function(callback) {
    del('dist');
    return cache.clearAll(callback);
})

// 清理文件: 除了images/文件夹，dist下的任意文件 (备用)
gulp.task('clean:dist', function(callback) {
    del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});


// 任务执行 生成模式 gulp build
gulp.task('build', function(callback) {
    runSequence('clean',
        ['sass', 'useref', 'images', 'fonts'],
        callback
    )
})