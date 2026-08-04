import { schedule } from "@netlify/functions";
import * as cheerio from "cheerio";
import { SignJWT, importPKCS8 } from "jose";
import nodemailer from "nodemailer";
import { renderEmailTemplate } from "./email-template.jsx";

export const DAILY_SEND_CRON = "20 21 * * *";

const config = {
  startDay: process.env.START_DAY ?? "2023/3/31",
  oneUrl: process.env.ONE_URL ?? "http://wufazhuce.com/",
  timezoneOffsetHours: Number(process.env.TIMEZONE_OFFSET_HOURS ?? 8),
  email: {
    host: process.env.SMTP_HOST ?? "smtp.qq.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: process.env.EMAIL_SUBJECT ?? "遇见楠楠后的每一天"
  },
  weather: {
    cityId: process.env.QWEATHER_CITY_ID ?? "101200105",
    latitude: process.env.QWEATHER_LATITUDE ?? "30.37",
    longitude: process.env.QWEATHER_LONGITUDE ?? "114.31",
    iconBaseUrl: process.env.QWEATHER_ICON_BASE_URL ?? "https://raw.githubusercontent.com/qwd/Icons/main/icons",
    host: process.env.QWEATHER_API_HOST,
    privateKey: process.env.QWEATHER_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    keyId: process.env.QWEATHER_KEY_ID,
    projectId: process.env.QWEATHER_PROJECT_ID
  }
};

const requiredEnv = [
  ["SMTP_USER", config.email.user],
  ["SMTP_PASS", config.email.pass],
  ["EMAIL_FROM", config.email.from],
  ["EMAIL_TO", config.email.to],
  ["QWEATHER_API_HOST", config.weather.host],
  ["QWEATHER_PRIVATE_KEY", config.weather.privateKey],
  ["QWEATHER_KEY_ID", config.weather.keyId],
  ["QWEATHER_PROJECT_ID", config.weather.projectId]
];

function assertConfig() {
  const missing = requiredEnv
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} ${url}`);
  }

  return response.text();
}

async function fetchJson(url, options = {}) {
  const text = await fetchText(url, options);
  return JSON.parse(text);
}

function normalizeImageUrl(url) {
  if (!url) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url.replace(/^http:\/\//, "https://");
}

function getWeatherIconUrl(iconCode) {
  const baseUrl = config.weather.iconBaseUrl.replace(/\/$/, "");
  return `${baseUrl}/${iconCode}.svg`;
}

async function generateWeatherJwt() {
  const privateKey = await importPKCS8(config.weather.privateKey, "EdDSA");
  const issuedAt = Math.floor(Date.now() / 1000) - 30;

  return new SignJWT({
    sub: config.weather.projectId,
    iat: issuedAt,
    exp: issuedAt + 900
  })
    .setProtectedHeader({ alg: "EdDSA", kid: config.weather.keyId })
    .sign(privateKey);
}

function withWeatherAuth(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

async function getOneData() {
  const html = await fetchText(config.oneUrl);
  const $ = cheerio.load(html);
  const todayOne = $("#carousel-one .carousel-inner .item").first();
  const imgUrl = todayOne.find(".fp-one-imagen").attr("src");

  return {
    imgUrl: normalizeImageUrl(imgUrl),
    type: todayOne.find(".fp-one-imagen-footer").text().trim(),
    text: todayOne.find(".fp-one-cita").text().trim()
  };
}

async function getWeatherTips(token) {
  const url = new URL(`https://${config.weather.host}/v7/indices/1d`);
  url.searchParams.set("location", config.weather.cityId);
  url.searchParams.set("type", "1,2,3,5,8,9,14,15");

  try {
    const data = await fetchJson(url, withWeatherAuth(token));

    if (data.code === "200" && Array.isArray(data.daily) && data.daily.length > 0) {
      return data.daily.map((item) => `${item.name}: ${item.text}`).join(" | ");
    }
  } catch (error) {
    console.warn("获取天气提醒失败:", error);
  }

  return "暂无天气提醒";
}

async function getAirQualityMap(token) {
  const url = `https://${config.weather.host}/airquality/v1/daily/${config.weather.latitude}/${config.weather.longitude}`;

  try {
    const data = await fetchJson(url, withWeatherAuth(token));
    const levelMap = {
      1: "level_1",
      2: "level_2",
      3: "level_3",
      4: "level_4",
      5: "level_5",
      6: "level_6"
    };

    return Object.fromEntries(
      (data.days ?? [])
        .map((dayData) => {
          const date = dayData.forecastStartTime?.split("T")[0];
          const cnIndex = dayData.indexes?.find((index) => index.code === "cn-mee");

          if (!date || !cnIndex) {
            return null;
          }

          return [
            date,
            {
              aqiValue: cnIndex.aqi,
              aqiCategory: cnIndex.category,
              aqiLevel: levelMap[cnIndex.level] ?? "level_1"
            }
          ];
        })
        .filter(Boolean)
    );
  } catch (error) {
    console.warn("获取空气质量失败:", error);
    return {};
  }
}

async function getWeatherData(token) {
  const url = new URL(`https://${config.weather.host}/v7/weather/3d`);
  url.searchParams.set("location", config.weather.cityId);

  const [weatherData, airQualityMap] = await Promise.all([
    fetchJson(url, withWeatherAuth(token)),
    getAirQualityMap(token)
  ]);

  if (weatherData.code !== "200" || !Array.isArray(weatherData.daily)) {
    throw new Error(`获取天气数据失败: ${weatherData.code ?? "未知错误"}`);
  }

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return weatherData.daily.map((day, index) => {
    const date = new Date(day.fxDate);
    const airQuality = airQualityMap[day.fxDate] ?? {
      aqiValue: 0,
      aqiCategory: "优",
      aqiLevel: "level_1"
    };

    return {
      Day: index === 0 ? "今天" : weekDays[date.getDay()],
      WeatherImgUrl: getWeatherIconUrl(day.iconDay),
      WeatherText: day.textDay + (day.textDay !== day.textNight ? `转${day.textNight}` : ""),
      DayWeather: day.textDay,
      NightWeather: day.textNight,
      Temperature: `${day.tempMin}°C ~ ${day.tempMax}°C`,
      TempMin: `${day.tempMin}°C`,
      TempMax: `${day.tempMax}°C`,
      WindDirection: day.windDirDay,
      WindLevel: `${day.windScaleDay}级`,
      WindSpeed: `${day.windSpeedDay} km/h`,
      Humidity: `${day.humidity}%`,
      Precipitation: `${day.precip} mm`,
      Pressure: `${day.pressure} hPa`,
      Visibility: `${day.vis} km`,
      Cloud: `${day.cloud}%`,
      UvIndex: day.uvIndex,
      Sunrise: day.sunrise,
      Sunset: day.sunset,
      Pollution: `空气${airQuality.aqiCategory}`,
      PollutionLevel: airQuality.aqiLevel,
      AQI: airQuality.aqiValue
    };
  });
}

function getTodayInConfiguredTimezone() {
  const now = new Date();
  return new Date(now.getTime() + config.timezoneOffsetHours * 60 * 60 * 1000);
}

function getBaseTemplateData() {
  const today = getTodayInConfiguredTimezone();
  const initDay = new Date(config.startDay);
  const lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
  const todaystr = `${today.getFullYear()} / ${today.getMonth() + 1} / ${today.getDate()}`;

  return { lastDay, todaystr };
}

async function sendMail(htmlData) {
  const html = await renderEmailTemplate(htmlData);
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });

  const info = await transporter.sendMail({
    from: config.email.from,
    to: config.email.to,
    envelope: {
      from: config.email.user,
      to: config.email.to.split(",").map((address) => address.trim()).filter(Boolean)
    },
    subject: config.email.subject,
    html
  });

  console.log("邮件发送成功", info.messageId);
}

export async function getAllDataAndSendMail() {
  assertConfig();

  const token = await generateWeatherJwt();
  const [todayOneData, weatherTip, threeDaysData] = await Promise.all([
    getOneData(),
    getWeatherTips(token),
    getWeatherData(token)
  ]);

  await sendMail({
    ...getBaseTemplateData(),
    todayOneData,
    weatherTip,
    threeDaysData
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "执行成功" })
  };
}

async function sendDailyEmail() {
  try {
    return await getAllDataAndSendMail();
  } catch (error) {
    console.error("Lambda function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "执行失败",
        error: error.message
      })
    };
  }
}

export const handler = schedule(DAILY_SEND_CRON, sendDailyEmail);
