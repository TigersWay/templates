// Gulp, packages & Options

const {src, dest, watch, series, parallel} = require('gulp');
const $ = require('gulp-load-plugins')({scope: ['devDependencies']});

const merge = require('merge-stream');

const pkg = require('./package.json');


// Variables & parameters

const { readdirSync, existsSync } = require('fs');
const { join } = require('path');

const templates = readdirSync('templates')
  .filter(folder => existsSync(`templates\/${folder}\/theme.json`))
  .map(folder => {
    return {theme: folder, ...require(`.\/templates\/${folder}\/theme.json`)}
  })
  .reduce((obj, item) => {
    return {...obj, [item.theme]: item};
  }, {});

var destPath = 'public';


// Tasks

const clean = async () => {
  return await require('del')([destPath]);
}

const justCopy = () => {
  return src([
      'src/favicon.ico',
      'src/**/*.{jpg,png}'
    ])
    .pipe(dest(destPath))
}

const buildHTML = () => {
  let tasks = Object.keys(templates).map(theme => {
    return src(`templates\/${theme}\/**\/*.njk`)
      .pipe($.nunjucks.compile({
        pkg: pkg,
        theme: templates[theme],
        ...require(`.\/templates\/${theme}\/data.json`)
      }))
      .pipe($.rename({extname: '.html'}))
      .pipe(dest(destPath + '/' + theme));
  });

  let root = src('src/**/*.njk')
    .pipe($.nunjucks.compile({
      pkg: pkg,
      themes: Object.values(templates)
    }))
    .pipe($.rename({extname: '.html'}))
    .pipe(dest(destPath));

  return merge(tasks, root);
}
const watchHTML = () => {return watch(['src/**/*.njk', 'templates/**/*.{njk,json}'], buildHTML)}

const buildCSS = () => {
  return src(['src/less/*.less'])
    .pipe($.less({
      //plugins: [new $.lessPluginLists()]
    }))
    .pipe($.nunjucks.compile({pkg: pkg}))
    .pipe($.groupCssMediaQueries())
    .pipe($.autoprefixer())
    .pipe(dest(destPath + '/css'))
    .pipe($.cleanCss({
      format: {
        breaks: {afterComment: true, afterRuleEnds: true} // Debug only
        //breaks: {afterComment: true}
      },
      level: {
        1: {specialComments: '1'},
        2: {restructureRules: true}
      }
    }))
    .pipe($.rename({suffix: '.min'}))
    .pipe(dest(destPath + '/css'));
}
const watchCSS = () => {return watch(['src/less/**/*.less'], buildCSS)}

const buildJS = () => {
  return src(['src/js/*.js'])
    .pipe($.concat('scripts.js'))
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(dest(destPath + '/js'));
}
const watchJS = () => {return watch(['src/js/**/*.js'], buildJS)}

const serve = () => {
  const flyimages = require('./src/flyimages-middleware.js')('public');

  return require('browser-sync').init({
    server: destPath,
    middleware: [{
      route: '/flyimages',
      handle: flyimages
    }],
    files: [
      destPath + '/**/*.html',
      destPath + '/js/*.min.js',
      destPath + '/css/*.min.css'
    ],
    browser: ['C:/Program Files/Firefox Developer Edition/firefox.exe']
  });
}



module.exports = {
  clean,
  justCopy,
  buildHTML,
  buildCSS,
  buildJS,

  build: series(
    clean,
    parallel(justCopy, buildHTML, buildCSS, buildJS)
  ),

  default: series(
    parallel(justCopy, buildHTML, buildCSS, buildJS),
    parallel(watchHTML, watchCSS, watchJS, serve)
  )
}
