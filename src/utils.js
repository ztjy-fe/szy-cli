/**
 * 工具函数
 */

'use strict';

let fs = require('fs');
let path = require('path');
let exec = require('child_process').execSync;
let os = require('os');

let platform = os.platform();

let log = require('./log');

module.exports = {
    isExist(tplPath){
        let p = path.normalize(tplPath);
        try {
            fs.accessSync(p, fs.R_OK & fs.W_OK, (err) => {
                if(err){
                    log.tips();
                    log.error(`${p} 没有权限`);
                }
            });
            return true;
        } catch (e){
            return false;
        }
    },

    isLocalTemplate(tpl){
        let isLocal = tpl.startsWith('.') || tpl.startsWith('/') || /^\w:/.test(tpl);

        if(isLocal){
            return isLocal;
        } else {
            return this.isExist(path.normalize(path.join(process.cwd(), tpl)));
        }
    },

    szyBinPath(){
        try {
            let binPath = platform == 'win32' ? exec('where szy') : exec('which szy');
            return binPath.toString();
        } catch (e) {
            log.error(`执行 which szy 命令错误: ${e.message}`);
        }
    },

    getAuthInfo(url){
        let config = {
            url:  url,
            method: 'get',
            headers: {
                'User-Agent': 'szy-cli'
            },
            timeout: 10000,
            auth:{}
        };

        let binPath = this.szyBinPath();
        let tokenPath = path.normalize(path.join(binPath,'../../','lib/node_modules/szy-cli/src/token.json'));

        if(this.isExist(tokenPath)){
            let authInfo = require(tokenPath);
            config.auth = authInfo;
        } else {
            delete config['auth'];
        }

        return config;
    }
};
