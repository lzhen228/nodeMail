const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const nodemailer = require("nodemailer"); //发送邮件的node插件
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库

//配置项

//纪念日
let startDay = "2023/3/31";
//当地拼音,需要在下面的墨迹天气url确认
// const local = "hebei/tangshan"

const local = "beijing/xicheng-district";


//发送者邮箱厂家
let EmianService = "outlook";
//发送者邮箱账户SMTP授权码
// let EamilAuth = {
//   user: "liaozhen1314@vip.qq.com",
//   pass: "icjtkhqvlvqrbaeh"
// };

let EamilAuth = {
  // type: 'OAuth2',
  user: "liaozhen1314@vip.qq.com",
  pass: "rqbxlvwemlyyhbbh"
};

//发送者昵称与邮箱地址
let EmailFrom = '"振哥哥" <liaozhen1314@vip.qq.com>';

//接收者邮箱地
// let EmailTo = "liaozhen1314@vip.qq.com";
let EmailTo = "863946813@qq.com,lzhen228@outlook.com";
//邮件主题
let EmailSubject = "遇见楠楠后的每一天";

//每日发送时间
let EmailHour = 5;
let EmialMinminute = 20;

// 爬取数据的url
const OneUrl = "http://wufazhuce.com/";
const WeatherUrl = "https://tianqi.moji.com/weather/china/" + local;


// 获取ONE内容
function getOneData() {
  let p = new Promise(function (resolve, reject) {
    superagent.get(OneUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let selectItem = $("#carousel-one .carousel-inner .item");
      let todayOne = selectItem[0];
      let todayOneData = {
        imgUrl: $(todayOne)
          .find(".fp-one-imagen")
          .attr("src"),
        type: $(todayOne)
          .find(".fp-one-imagen-footer")
          .text()
          .replace(/(^\s*)|(\s*$)/g, ""),
        text: $(todayOne)
          .find(".fp-one-cita")
          .text()
          .replace(/(^\s*)|(\s*$)/g, "")
      };
      resolve(todayOneData)
    });
  })
  return p
}

// 获取天气提醒
function getWeatherTips() {
  let p = new Promise(function (resolve, reject) {
    superagent.get(WeatherUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".wea_tips").each(function (i, elem) {
        weatherTip = $(elem)
          .find("em")
          .text();
      });
      resolve(weatherTip)
    });
  })
  return p
}

// 获取天气预报
function getWeatherData() {
  let p = new Promise(function (resolve, reject) {
    superagent.get(WeatherUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      // let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".forecast .days").each(function (i, elem) {
        const SingleDay = $(elem).find("li");
        threeDaysData.push({
          Day: $(SingleDay[0])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WeatherImgUrl: $(SingleDay[1])
            .find("img")
            .attr("src"),
          WeatherText: $(SingleDay[1])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Temperature: $(SingleDay[2])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindDirection: $(SingleDay[3])
            .find("em")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindLevel: $(SingleDay[3])
            .find("b")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Pollution: $(SingleDay[4])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          PollutionLevel: $(SingleDay[4])
            .find("strong")
            .attr("class")
        });
      });
      resolve(threeDaysData)
    });
  });
  return p
}

// 发动邮件
function sendMail(HtmlData) {
  return new Promise((resolve, reject) => {
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
    );
    const html = template(HtmlData);

    let transporter = nodemailer.createTransport({
      // service: EmianService,
      host: 'smtp.qq.com',
      port: 587,
      secure: false, // 使用 TLS
      auth: EamilAuth
    });

    let mailOptions = {
      from: EmailFrom,
      to: EmailTo,
      subject: EmailSubject,
      html: html
    };

    transporter.sendMail(mailOptions, (error, info = {}) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("邮件发送成功", info.messageId);
        console.log("静等下一次发送");
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: "执行成功" })
        });
      }
    });
  });
}

// 聚合
function getAllDataAndSendMail() {
  return new Promise((resolve, reject) => {
    let HtmlData = {};
    // how long with
    let today = new Date();
    console.log(today)
    let initDay = new Date(startDay);
    let lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
    let todaystr =
      today.getFullYear() +
      " / " +
      (today.getMonth() + 1) +
      " / " +
      today.getDate();
    HtmlData["lastDay"] = lastDay;
    HtmlData["todaystr"] = todaystr;

    Promise.all([getOneData(), getWeatherTips(), getWeatherData()]).then(
      async function (data) {
        HtmlData["todayOneData"] = data[0];
        HtmlData["weatherTip"] = data[1];
        HtmlData["threeDaysData"] = data[2];
        try {
          const result = await sendMail(HtmlData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    ).catch(function (err) {
      console.log('获取数据失败： ', err);
      reject(err);
    })
  });
}

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = EmailHour;
rule.minute = EmialMinminute;
// console.log('NodeMail: 开始等待目标时刻...')
// let j = schedule.scheduleJob(rule, function () {
//   console.log("执行任务");
// });
exports.handler = async (event) => {
  try {
    const result = await getAllDataAndSendMail();
    return result;
  } catch (error) {
    console.error('Lambda function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "执行失败",
        error: error.message
      })
    };
  }
};
