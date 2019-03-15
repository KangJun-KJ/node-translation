const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const request = require("request");
const chalk = require("chalk");
const ora = require("ora");
const log = console.log;
const historyPath = path.resolve(__dirname, './history.json');
let history = JSON.parse(fs.readFileSync(historyPath));

module.exports = function (strarr) {
  strarr = strarr.join(" ");
  let q = strarr,
    from = 'auto',
    to = 'to',
    appKey = '36ca33a67ad809a0',
    miyao = 'VgwxaiudPdwlyT8pJHM5jSNVozoBjIXY',
    signType = 'v3',
    salt = Math.random() * 100000,
    curtime = parseInt(Date.now() / 1000);

  q = encodeURIComponent(q);

  let str = appKey + q + salt + curtime + miyao;
  let sign = crypto.createHash('sha256').update(str).digest('hex');
  //网易云申请的API接口
  // let url = `http://openapi.youdao.com/api?q=${q}&from=${from}&to=${to}&appKey=${appKey}&salt=${salt}&sign=${sign}&signType=${signType}&curtime=${curtime}`;
  // 有道云官网爬取出来的接口,不需要key 地址：https://ai.youdao.com/product-fanyi.s 
  let url = `https://aidemo.youdao.com/trans?from=auto&to=auto&q=${q}`;

  const spinner = ora({
    color: "yellow",
  }).start();
  request({
      url
    },
    function (error, response, body) {
      spinner.stop();
      if (error) {
        log("请求失败");
        console.log(error)
        return;
      }
      let data = JSON.parse(response.body);
      let key = decodeURIComponent(q),
        text = data.translation.join(";");
      if (data.errorCode == 0) {
        log(chalk.white(key) + " " + chalk.gray('use youdao api:'));
        if (data.translation) {
          log();
          log(chalk.bgCyan("  翻译 ") + "：  " + chalk.yellow.underline(text));
          log();
        }
        if (data.basic && data.basic.explains) {
          data.basic.explains.forEach((val) => {
            log(chalk.green(` - ${val}`));
          });
          log();
        }
        if (data.web) {
          data.web.forEach((val, i) => {
            log(chalk.bold(`${i+1}. ${val.key.replace(new RegExp(q,'gi'),chalk.underline.yellow(q))} :`));
            log(chalk.green(`   ${val.value}`));
          })
          log();

        }
        if (text) {
          if (history[key]) {
            history[key].count++;
          } else {
            history[key] = {
              text,
              count: 1
            }
          }
          // log(history)
          fs.writeFile(historyPath, JSON.stringify(history), function (err) {
            if (err) {
              console.log(err)
            }
            // console.log('存储成功！');
          });
        }

      } else {

        log(chalk.cyan("请求错误码：") + chalk.red(data.errorCode));
        log(chalk.cyan("错误码含义参考：" + chalk.blue("https://ai.youdao.com/docs/doc-trans-api.s#p08")));
      }
    })
}