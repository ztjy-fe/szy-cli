/**
 * 检查命令行工具版本
 */

'use strict';

let semver = require('semver');
let chalk = require('chalk');
let axios = require('axios');
let ora = require('ora');

let pkg = require('../package.json');
let log = require('./log');

log.tips();

module.exports = function (done) {

    let spinner = ora({
        text: "检查szy cli版本中...",
        color:"blue"
    }).start();

    if (!semver.satisfies(process.version, pkg.engines.node)) {
        spinner.text = chalk.white('szy cli:版本检查失败, 错误信息:');
        spinner.fail();

        log.tips();
        log.error(`  你必须升级Node版本为 ${pkg.engines.node} 以使用szy cli`);
    }

    axios({
        url: 'https://registry.npmjs.org/szy-cli',
        method: 'get',
        timeout: 10000
    }).then((res) => {
        if(res.status === 200){
            spinner.text = chalk.green('szy cli版本检查完成.');
            spinner.succeed();

            let local = pkg.version;
            let latest = res.data['dist-tags'].latest;

            if (semver.lt(local, latest)) {
                log.tips();
                log.tips(chalk.blue('  szy cli有新的版本.'));
                log.tips();
                log.tips(`  最新版本:    ${chalk.green(latest)}`);
                log.tips(`  当前版本:    ${chalk.red(local)}`)
                log.tips(`  升级成最新: npm update -g szy-cli`);
                log.tips();
            }
            done();
        }
    }).catch((err) => {
        if(err){
            let res = err.response;

            spinner.text = chalk.white('szy cli:检查szy cli版本失败, 错误信息:');
            spinner.fail();

            log.tips();

            if(res){
                log.tips(chalk.red(`     ${res.statusText}: ${res.headers.status}`));
            } else {
                log.tips(chalk.red(`     ${err.message}`));
            }
            log.tips();
            done();
        }
    });
};
