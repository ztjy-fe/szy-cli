/**
 * 获取用户配置
 */

'use strict';

let path = require('path');
let metadata = require('read-metadata');
let getGithubConfig = require('./config');
let validateName = require('validate-npm-package-name');

let utils = require('./utils');

/**
 * 从模板的meta.js中读取配置
 * @param {String} dir
 * @return {Object}
 */

function getMetadata (dir) {
    let json = path.join(dir, 'meta.json');
    let js = path.join(dir, 'meta.js');
    let setting = {};

    if (utils.isExist(json)) {
        setting = metadata.sync(json);
    } else if (utils.isExist(js)) {
        let req = require(path.resolve(js));
        if (req !== Object(req)) {
            throw new Error('meta.js 必须返回一个对像');
        }
        setting = req;
    } else {
        return {
            prompts: {},
            filters: {}
        }
    }

    return setting
}

/**
 * 给prompt设置默认值
 * @param {Object} setting
 * @param {String} key
 * @param {String} val
 */

function setDefault (setting, key, val) {

    let prompts = setting.prompts || (setting.prompts = {});
    if (!prompts[key] || typeof prompts[key] !== 'object') {
        prompts[key] = {
            'type': 'string',
            'default': val
        }
    } else {
        prompts[key]['default'] = val;
    }
}

/**
 * 检查项目是否是有效的npm包
 * @param setting
 */

function setValidateName (setting) {
    let name = setting.prompts.name;
    let customValidate = name.validate;

    name.validate = function (name) {
        let res = validateName(name);
        if (!res.validForNewPackages) {
            let errors = (res.errors || []).concat(res.warnings || []);
            return 'Sorry, ' + errors.join(' and ') + '.';
        }
        if (typeof customValidate === 'function') {
            return customValidate(name);
        }

        return true
    }
}

/**
 * Read prompts metadata from template.
 *
 * @param {String} projectName
 * @param {String} tmpDir
 * @return {Object}
 */

module.exports = function (projectName, tmpDir) {
    let setting = getMetadata(tmpDir);

    setDefault(setting, 'name', projectName);
    setValidateName(setting);

    let authorInfo = getGithubConfig();
    if (authorInfo) {
        setDefault(setting, 'author', authorInfo);
    }

    return setting;
};