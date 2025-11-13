const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const nodemailer = require("nodemailer"); //发送邮件的node插件
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库

// 懒加载 ESM-only 的 jose 库, 兼容 Netlify CommonJS 运行时
let joseModulePromise;
async function loadJose() {
  if (!joseModulePromise) {
    joseModulePromise = import("jose");
  }
  return joseModulePromise;
}

//纪念日
let startDay = "2023/3/31";

// 和风天气配置
// 城市ID (江夏区的城市ID,可在 https://github.com/qwd/LocationList/blob/master/China-City-List-latest.csv 查询)
const cityId = "101200105"; // 江夏区
// 和风天气API Host (每个开发者独立的API地址)
const weatherApiHost = 'pj6yvy8dmm.re.qweatherapi.com';
// 和风天气 JWT 配置
const YourPrivateKey = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIF1snuHKew+3jKVc9l23kU+bno19m8wrhEZPOBorrqCm
-----END PRIVATE KEY-----`; // 你的私钥 (PRIVATE KEY)
const YourKeyId = 'KEPPBN3BCC'; // 你的 Key ID
const YourProjectId = '3H2CNJJQMR'; // 你的项目 ID (Project ID)


let EamilAuth = {
  // type: 'OAuth2',
  user: "liaozhen1314@vip.qq.com",
  pass: "rqbxlvwemlyyhbbh"
};

//发送者昵称与邮箱地址
let EmailFrom = '"振哥哥" <liaozhen1314@vip.qq.com>';

//接收者邮箱地
// let EmailTo = "liaozhen1314@vip.qq.com"  ;
let EmailTo = "863946813@qq.com,lzhen228@outlook.com";
//邮件主题
let EmailSubject = "遇见楠楠后的每一天";

//每日发送时间
let EmailHour = 5;
let EmialMinminute = 20;

// 爬取数据的url
const OneUrl = "http://wufazhuce.com/";
// 和风天气API (使用独立API Host)
const WeatherApiUrl = `https://${weatherApiHost}/v7/weather/3d`;
const WeatherIndicesUrl = `https://${weatherApiHost}/v7/indices/1d`;
const WeatherAirUrl = `https://${weatherApiHost}/v7/air/now`;

// 生成和风天气JWT Token
async function generateWeatherJWT() {
  try {
    const { SignJWT, importPKCS8 } = await loadJose();
    const privateKey = await importPKCS8(YourPrivateKey, 'EdDSA');
    const customHeader = {
      alg: 'EdDSA',
      kid: YourKeyId
    };
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 900; // 15分钟有效期
    const customPayload = {
      sub: YourProjectId,
      iat: iat,
      exp: exp
    };
    const token = await new SignJWT(customPayload)
      .setProtectedHeader(customHeader)
      .sign(privateKey);
    return token;
  } catch (error) {
    console.error('生成JWT失败:', error);
    throw error;
  }
}

// 获取ONE内容
function getOneData() {
  let p = new Promise(function (resolve, reject) {
    superagent.get(OneUrl).end(function (err, res) {
      console.log("🚀 ~ getOneData ~ err:", err)
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let selectItem = $("#carousel-one .carousel-inner .item");
      let todayOne = selectItem[0];
      let imgUrl = $(todayOne).find(".fp-one-imagen").attr("src");
      // 确保图片URL是完整的(包含协议)
      if (imgUrl && !imgUrl.startsWith('http')) {
        imgUrl = 'http:' + imgUrl;
      }
      let todayOneData = {
        imgUrl: imgUrl,
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

// 获取天气生活指数提醒
async function getWeatherTips() {
  const token = await generateWeatherJWT();
  let p = new Promise(function (resolve, reject) {
    superagent
      .get(WeatherIndicesUrl)
      .set('Authorization', `Bearer ${token}`)
      .query({
        location: cityId,
        type: "1,2,3,5,8,9,14,15" // 运动、洗车、穿衣、紫外线、舒适度、感冒、晾晒、交通
      })
      .end(function (err, res) {
        if (err) {
          reject(err);
          return;
        }
        try {
          const data = JSON.parse(res.text);
          if (data.code === "200" && data.daily && data.daily.length > 0) {
            // 组合生活指数提醒
            const tips = data.daily.map(item => `${item.name}: ${item.text}`).join(" | ");
            resolve(tips);
          } else {
            resolve("暂无天气提醒");
          }
        } catch (e) {
          console.log("解析天气提醒数据失败:", e);
          resolve("暂无天气提醒");
        }
      });
  });
  return p;
}

// 获取天气预报(包含空气质量)
async function getWeatherData() {
  const token = await generateWeatherJWT();
  let p = new Promise(function (resolve, reject) {
    // 先获取天气预报
    superagent
      .get(WeatherApiUrl)
      .set('Authorization', `Bearer ${token}`)
      .query({
        location: cityId
      })
      .end(function (err, res) {
        if (err) {
          reject(err);
          return;
        }
        try {
          const weatherData = JSON.parse(res.text);
          if (weatherData.code !== "200" || !weatherData.daily) {
            reject(new Error("获取天气数据失败: " + (weatherData.code || "未知错误")));
            return;
          }

          // 再获取空气质量数据
          superagent
            .get(WeatherAirUrl)
            .set('Authorization', `Bearer ${token}`)
            .query({
              location: cityId
            })
            .end(function (airErr, airRes) {
              let aqiCategory = "优";
              let aqiLevel = "level_1";

              if (!airErr && airRes) {
                try {
                  const airData = JSON.parse(airRes.text);
                  if (airData.code === "200" && airData.now) {
                    aqiCategory = airData.now.category || "优";
                    // 根据AQI等级映射level
                    const categoryMap = {
                      "优": "level_1",
                      "良": "level_2",
                      "轻度污染": "level_3",
                      "中度污染": "level_4",
                      "重度污染": "level_5",
                      "严重污染": "level_6"
                    };
                    aqiLevel = categoryMap[aqiCategory] || "level_1";
                  }
                } catch (e) {
                  console.log("解析空气质量数据失败:", e);
                }
              }

              // 组装天气数据
              let threeDaysData = weatherData.daily.map((day, index) => {
                const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
                const date = new Date(day.fxDate);
                const dayStr = index === 0 ? "今天" : weekDays[date.getDay()];

                return {
                  Day: dayStr,
                  WeatherImgUrl: `https://a.hecdn.net/img/common/icon/202106d/${day.iconDay}.png`,
                  WeatherText: day.textDay + (day.textDay !== day.textNight ? "转" + day.textNight : ""),
                  Temperature: day.tempMin + "°C ~ " + day.tempMax + "°C",
                  WindDirection: day.windDirDay,
                  WindLevel: day.windScaleDay + "级",
                  Pollution: "空气" + aqiCategory,
                  PollutionLevel: aqiLevel
                };
              });
              resolve(threeDaysData);
            });
        } catch (e) {
          console.log("解析天气数据失败:", e);
          reject(e);
        }
      });
  });
  return p;
}

// 发动邮件
function sendMail(HtmlData) {
  return new Promise((resolve, reject) => {
    const template = ejs.compile(
      fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
    );
    const html = template(HtmlData);

    let transporter = nodemailer.createTransport({
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
    // Netlify函数运行环境的时区默认是UTC 时区
    // 北京时间 = UTC时间 + 8小时（8*60*60*1000毫秒）
    const utcDate = new Date();
    let today = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);;
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
