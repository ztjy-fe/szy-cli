/**
 * 获取用户输入
 */

'use strict';

let async = require('async');
let inquirer = require('inquirer');
let chalk = require('chalk');

// 支持的提示类型
let promptMapping = {
    string: 'input',
    boolean: 'confirm'
};

/**
 * 根据问题，返回结果.
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

module.exports = function (prompts, data, done) {
    //https://github.com/metalsmith/metalsmith/blob/master/examples/project-scaffolder/build.js#L26
    async.eachSeries(Object.keys(prompts), function (key, done) {
        promptWraper(data, key, prompts[key], done);
    }, done);
};


/**
 * Inquirer prompt包装方法.
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function promptWraper (data, key, prompt, done) {
    let msg = prompt.message || prompt.label || key;
    let promptType = promptMapping[prompt.type] || prompt.type;

    // meta配置文件中的when为false时，跳过
    if (prompt.when && !data[prompt.when]) {
        return done();
    }

    let promptDefault = prompt.default;
    if (typeof prompt.default === 'function') {
        promptDefault = function () {
            return prompt.default.bind(this)(data)
        }
    }

    inquirer.prompt([{
        type: promptType,
        name: key,
        message: `${msg}:`,
        choices: prompt.choices || [],
        filter: prompt.filter || function (val) {
            return val;
        },
        default: promptDefault,
        validate: prompt.validate || function () {
            return true;
        }
    }]).then((anwsers) => {
        if (Array.isArray(anwsers[key])){
            data[key] = [];
            anwsers[key].forEach((choice) => {
                data[key].push(choice);
            });
        } else {
            data[key] = anwsers[key];
        }
        done();
    });
}