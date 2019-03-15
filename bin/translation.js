const fs = require("fs");
const path = require('path');
const program = require('commander');
const package = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')));
const history = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../history.json')));
const translation = require("../index.js");

// console.log(package);
program
  .usage(`\r\n  Repository: ${package.repository.url}`)
  .version(package.version)
  .option("-v, --version", "show Version")
  .option('-t, --show-table', 'show translation history data')
  .option("-c, --clear-table", 'clean translation history data')
  .parse(process.argv);

if (program.showTable) {
  // 记录这次翻译的结果
  let data=history;
  let num = [],
    len1 = 8,
    len2 = 8,
    len3 = 8;
  //获取字符串长度，英文为一个长度，中文为两个长度
  const getStringLen=(str)=>{
    let c=0,re=/[\u4e00-\u9fa5]/;
    for(let i=0,len=str.length;i<len;i++){
      if(re.test(str[i])){
        c+=2;
      }else{
        c++;
      }
    }
    return c;
  }
  for (var k in data) {
    num.push({
      value: k,
      text: data[k].text,
      count: data[k].count
    });
    len1 = Math.max(getStringLen(k), len1);
    len2 = Math.max(getStringLen(data[k].text), len2);
    len3 = Math.max((data[k].count + "").length, len3);
  }
  if(num.length==0){
    console.log("你有没有翻译记录哦,请使用tn wrod 来查看翻译吧  \r\n");
    return ;
  }
  num.sort((s1, s2) => s2.count - s1.count);
  console.log(`翻译文本 ${' '.repeat(len1-8)}| 翻译结果${' '.repeat(len2-7)}|  翻译次数`);
  console.log(`${'-'.repeat(len1)}  ${'-'.repeat(len2+1)}  ${'-'.repeat(len3+1)}  `);
  num.forEach((val, i) => {
    // console.log(len2-val.text.length*2);
    console.log(`${val.value+" ".repeat(len1-getStringLen(val.value))} | ${val.text+" ".repeat(len2-getStringLen(val.text))} | ${val.count}`)
  })
  console.log(`${'-'.repeat(len1)}  ${'-'.repeat(len2+1)}  ${'-'.repeat(len3+1)}  `);
} else if (program.clearTable) {
  fs.writeFile("./history.json", JSON.stringify({}), function (err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("  Clear translation history success ！！");
  });

} else if (program.args.length > 0) {
  translation(program.args); //调用翻译接口并且打印出来

} else {
  console.log('\r\n You can input tn -h get more hlep~');
}