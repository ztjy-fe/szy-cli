/**
 * 生成模板
 */

'use strict';

let Handlebars = require('handlebars');
let Metalsmith = require('metalsmith');
let ora = require('ora');
let async = require('async');
let render = require('consolidate').handlebars.render;
let path = require('path');
let chalk = require('chalk');

let log = require('./log');
let getSetting  = require('./settings');
let ask = require('./ask');
let filesFilter = require('./files-filter');
let utils = require('./utils');

// 支持vue模板
Handlebars.registerHelper('if_eq', function (a, b, opts) {
    return a === b
        ? opts.fn(this)
        : opts.inverse(this)
});

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
    return a === b
        ? opts.inverse(this)
        : opts.fn(this)
});

/**
 * 生成模板从tmpDir到dest
 * @param {String} projectName
 * @param {String} tmpDir
 * @param {String} dest
 * @param {Function} done
 */

module.exports = function (projectName, tmpDir, dest, done) {
    let metalsmith;

    let setting = getSetting(projectName, tmpDir);
    let tplPath = path.join(tmpDir, 'template');

    // 注册handlebars helpers
    setting.helpers && Object.keys(setting.helpers).map(function (key) {
        Handlebars.registerHelper(key, setting.helpers[key])
    });

    if(utils.isExist(tplPath)){
        metalsmith = Metalsmith(tplPath);
    } else {
        metalsmith = Metalsmith(tmpDir);
    }

    let data = Object.assign(metalsmith.metadata(), {
        destDirName: projectName,
        isCwd: dest === process.cwd(),
        noEscape: true
    });

    ora({
        text: `${projectName} 生成中...`,
    }).stopAndPersist(chalk.blue('**'));

    log.tips();

    metalsmith
        .use(askQuestions(setting))
        .use(filter(setting))
        .use(template)
        .clean(false)
        .source('.') // 从模板的根目录开始 `./src` 是Metalsmith的默认目录
        .destination(dest)
        .build(function (err) {
            log.tips();

            if(err){
                return done(err);
            }

            ora({
                text: chalk.green(`${projectName} 生成成功！`)
            }).succeed();

            log.tips();

            done(null,setting.completeMessage);
        });

    return data;
};

//询问用户输入信息
function askQuestions (setting) {
    return (files, metalsmith, done) => {
        ask(setting.prompts, metalsmith.metadata(), done);
    }
}

//文件过滤
function filter (setting) {
    return (files,metalsmith,done) => {
        filesFilter(setting.filters,files,metalsmith.metadata(),done);
    }
}

//模板生成
function template (files,metalsmith,done) {
    let keys = Object.keys(files);
    let metadata = metalsmith.metadata();

    async.each(keys, (file, next) => {

        //判断文件是否在node_modules目录
        let inNodeModules = /node_modules/.test(file);
        let str = inNodeModules ? '' : files[file].contents.toString();

        // 不渲染node_modules目录
        if (inNodeModules || !/{{([^{}]+)}}/g.test(str)) {
            return next();
        }

        render(str, metadata, (err, res) => {
            if (err) {
                return next(err);
            }
            files[file].contents = new Buffer(res);
            next();
        });
    },done);
}