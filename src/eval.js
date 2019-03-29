/**
 * 执行js.
 */

let log = require('./log');

module.exports = function evaluate (exp, data) {
    let fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    } catch (e) {
        log.error(`过滤失败: ${exp}`);
    }
};