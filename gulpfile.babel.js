import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();

gulp.task('styles', () => {
  return gulp.src('./*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/'))
});

gulp.task('html', ['styles'], () => {

  return gulp.src(['./gistify.js', '.tmp/gistify.css'])
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('build', ['styles', 'html'], () => {
  var ret = gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
  del('.tmp');
  return ret;
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});