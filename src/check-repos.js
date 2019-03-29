/**
 * 检查仓库在github中是否存在.
 */

'use strict';

let axios = require('axios');
let ora = require('ora');
let chalk = require('chalk');

let utils = require('../src/utils');
let log = require('./log');

module.exports = function (repo,done){
    let oraer = ora({
        text: '检查该仓库是否存在...',
        color:"blue"
    }).start();

    // const REQUEST_URL = `https://api.github.com/users/${repoInfo[0]}/repos`;
    const URL = `https://github.com/${repo}`;

    axios(utils.getAuthInfo(URL)).then((res) => {
        log.tips();
        if(res.status === 200 ){
            oraer.text = chalk.green('检查成功，仓库存在.');
            oraer.succeed();
            log.tips();
            done(repo);
        } else {
            oraer.stop();

            log.tips();
            log.tips(chalk.red(`检查失败: ${repo} 不存在.`));
            log.tips();
            log.tips(`请检查(${chalk.blue(URL)}) 是否可用.`);
            process.exit(1);
        }
    }).catch((err) => {
        if(err){
            let res = err.response;

            oraer.text = chalk.white(`szy cli: ${repo} 检查失败, 错误信息:`);
            oraer.fail();
            log.tips();

            if(res && res.status === 403){
                //api rate limit:https://developer.github.com/v3/#rate-limiting
                log.tips(chalk.red(`     ${res.statusText}: ${res.data.message}\n\ndocumentation: ${res.data.documentation_url}`));
                log.tips();
                log.tips(`     请使用 ${chalk.blue('szy token')} 命令，设置github认证信息. 查看github文档，获得更多详情.`);
                log.tips();
                log.tips('     documentation: https://developer.github.com/v3/auth/#basic-authentication');

            } else {
                if(res){
                    log.tips(chalk.red(`     ${res.statusText}: ${res.headers.status}`));
                    log.tips();
                    log.tips(`请确认(${chalk.blue(URL)})是否可用.`);
                } else {
                    log.error(`     ${err.message}`);
                }
            }

            process.exit(1);
        }
    });
};