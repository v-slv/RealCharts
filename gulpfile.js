const gulp = require('gulp');
const webpack = require('webpack-stream');
gulp.task('default', function() {
    return gulp.src('src/RealCharts.ts')
  .pipe(webpack({
    watch: true,
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    }
  }))
  .pipe(gulp.dest('dist/'));
  });
