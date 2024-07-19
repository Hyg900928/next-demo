const gulp = require('gulp');
const through = require('through2');
const path = require('path');
const fs = require('fs');
const clean = require('gulp-clean');

const register = require('@babel/register');
const { watch, series } = require('gulp');
const diff = require('./scripts/diff');
const args = require('minimist')(process.argv.slice(2));
const defaultLang = 'en';
const lang = args.lang || defaultLang;
const backupFolder = path.resolve(__dirname, `.backup/${lang}`);
const dataFolder = path.resolve(__dirname, `.data/${lang}`);
const sourceFolder = path.resolve(__dirname, `src/source/${lang}`);
// 根据环境变量确定当前的环境
const isProduction = process.env.NODE_ENV === 'production';

// 设置 Babel 注册以处理路径别名和 ES 模块
register({
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
  ],
  cache: false,
  extensions: ['.js'],
});

function folderContainsFile(folderPath, fileName) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const isFilePresent = files.includes(fileName);
      resolve(isFilePresent);
    });
  });
}

// 将js文件转成json文件
function transformEsModuleToJson() {
  return through.obj(function (file, enc, cb) {
    if (file.isBuffer()) {

      // 获取文件路径
      const filePath = path.resolve(file.path);

      // 清除缓存以确保每次都重新加载模块
      clearRequireCache();
      // 动态导入模块并获取其默认导出
      let moduleExports;
      try {
        moduleExports = require(filePath);
        if (moduleExports && moduleExports.__esModule) {
          moduleExports = moduleExports.default;
        }
      } catch (err) {
        return cb(err);
      }

      // 将默认导出转换为 JSON 字符串
      const jsonString = JSON.stringify(moduleExports, null, 2);
      file.contents = Buffer.from(jsonString);
      file.extname = '.json';
    }
    cb(null, file);
  });
}

function transformSingle(source) {
  return gulp
    .src(`src/source/en/${source}.js`)
    .pipe(transformEsModuleToJson())
    .pipe(gulp.dest(`.data/${lang}`));
}

function cleanBackup() {
  return gulp.src(backupFolder, { allowEmpty: true, read: false }).pipe(clean());
}

function cleanData() {
  return gulp.src(dataFolder, { allowEmpty: true, read: false }).pipe(clean());
}

/**
 * 备份source文件, 为增量发布做比较
 * @returns {*}
 */
function backupSource() {
  return gulp.src('src/source/**/*.js').pipe(gulp.dest('.backup'));
}

// 清理 require 缓存
function clearRequireCache() {
  Object.keys(require.cache).forEach(function (key) {
    if (key.includes('src')) {
      delete require.cache[require.resolve(key)];
    }
  });
}
// 转换所有source文件, 一般用在发版时
function transformAll() {
  return gulp.src('src/source/**/*.js').pipe(transformEsModuleToJson()).pipe(gulp.dest('.data'));
}

// 手动批量处理, 一般用于增量发布
async function batchTransform(cb) {
  // 初始化
  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }
  // 和之前的备份进行比较, 取出改动的文件;
  const files = await diff.findModifiedFiles(sourceFolder, backupFolder);
  console.log('diffFiles===>', files)
  for (let i = 0; i < files.length; i++) {
    const source = files[i];
    const sourceName = path.basename(source, path.extname(source));
    const isExistInsource = await folderContainsFile(sourceFolder, `${source}`);
    const isExistInBackup = await folderContainsFile(backupFolder, `${source}`);
    const isExistInData = await folderContainsFile(dataFolder, `${sourceName}.json`);

    if (isExistInsource) {
      transformSingle(sourceName);
    } else {
      if (isExistInBackup) {
        fs.unlinkSync(path.resolve(backupFolder, `${source}`));
      }
      if (isExistInData) {
        fs.unlinkSync(path.resolve(dataFolder, `${sourceName}.json`));
      }
    }
  }

  cb();
}

function devTask() {
  watch('src/source/**/*.js', { ignoreInitial: false }, series(cleanData, cleanBackup, transformAll));
}

// 增量部署完之后,要重新备份
exports.batchTransform = series(batchTransform, backupSource);

// exports.transformAll = !isProduction ? devTask : gulp.series(transformAll);
// exports.default = gulp.series(batchTransform);
// exports.default = gulp.series(backupSource, transformAll);
if (isProduction) {
  exports.default = gulp.series(cleanData, cleanBackup, backupSource, transformAll);
} else {
  exports.default = devTask;
}
