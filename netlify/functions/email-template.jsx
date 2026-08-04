import React from "react";
import { render } from "@react-email/render";

const pollutionColors = {
  level_1: "#2f855a",
  level_2: "#b7791f",
  level_3: "#c05621",
  level_4: "#c53030",
  level_5: "#6b46c1",
  level_6: "#97266d",
};

const styles = {
  body: {
    margin: 0,
    padding: "28px 0",
    backgroundColor: "#f4f1ea",
    color: "#1f2933",
    fontFamily:
      'Avenir Next, "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#fbfaf7",
    border: "1px solid #e4dfd3",
    borderRadius: "18px",
    overflow: "hidden",
  },
  content: {
    padding: "24px",
  },
  hero: {
    padding: "28px 26px",
    backgroundColor: "#23312d",
    color: "#f7f2e8",
  },
  card: {
    padding: "18px",
    margin: "0 0 16px",
    border: "1px solid #e6e0d4",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
  },
  sectionLabel: {
    margin: "0 0 12px",
    color: "#7b7468",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  metricLabel: {
    margin: "0 0 4px",
    color: "#81786b",
    fontSize: "12px",
  },
  metricValue: {
    margin: 0,
    color: "#252a2e",
    fontSize: "16px",
    fontWeight: 700,
  },
};

function parseWeatherTips(weatherTip) {
  return (weatherTip ?? "")
    .split(" | ")
    .map((tip) => {
      const [label, ...valueParts] = tip.split(": ");
      return { label, value: valueParts.join(": ") };
    })
    .filter((tip) => tip.label && tip.value)
    .slice(0, 4);
}

function SectionLabel({ children }) {
  return <p style={styles.sectionLabel}>{children}</p>;
}

function Metric({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <td width="50%" style={{ padding: "10px 8px", verticalAlign: "top" }}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </td>
  );
}

function Header({ lastDay, todaystr, todayWeather }) {
  return (
    <div style={styles.hero}>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#cfc6b5",
                  fontSize: "13px",
                }}
              >
                {todaystr}
              </p>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "28px",
                  fontWeight: 700,
                  lineHeight: "36px",
                }}
              >
                今天是我们在一起的第 {lastDay} 天
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#d8d0c1",
                  fontSize: "14px",
                  lineHeight: "22px",
                }}
              >
                今日{todayWeather?.DayWeather ?? "天气"}，
                {todayWeather?.Temperature ?? "温度待更新"}
              </p>
            </td>
            {todayWeather?.WeatherImgUrl && (
              <td align="right" width="84" style={{ verticalAlign: "top" }}>
                <img
                  src={todayWeather.WeatherImgUrl}
                  alt="天气"
                  width="64"
                  height="64"
                  style={{ display: "block" }}
                />
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WeatherSummary({ todayWeather }) {
  if (!todayWeather) {
    return null;
  }

  const pollutionColor =
    pollutionColors[todayWeather.PollutionLevel] ?? pollutionColors.level_1;

  return (
    <div style={styles.card}>
      <SectionLabel>Today's Brief</SectionLabel>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#111827",
                  fontSize: "36px",
                  fontWeight: 700,
                  lineHeight: "42px",
                }}
              >
                {todayWeather.TempMin} / {todayWeather.TempMax}
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#5f6b66",
                  fontSize: "15px",
                  lineHeight: "24px",
                }}
              >
                白天{todayWeather.DayWeather}，夜间{todayWeather.NightWeather}，
                {todayWeather.WindDirection}
                {todayWeather.WindLevel}
              </p>
            </td>
            <td align="right" width="96" style={{ verticalAlign: "top" }}>
              <p
                style={{
                  margin: "0 0 6px",
                  color: pollutionColor,
                  fontSize: "26px",
                  fontWeight: 700,
                }}
              >
                {todayWeather.AQI || "--"}
              </p>
              <p
                style={{
                  margin: 0,
                  color: pollutionColor,
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {todayWeather.Pollution}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WeatherMetrics({ todayWeather }) {
  if (!todayWeather) {
    return null;
  }

  return (
    <div style={styles.card}>
      <SectionLabel>Details</SectionLabel>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <Metric label="降水量" value={todayWeather.Precipitation} />
            <Metric label="湿度" value={todayWeather.Humidity} />
          </tr>
          <tr>
            <Metric
              label="紫外线"
              value={
                todayWeather.UvIndex ? `指数 ${todayWeather.UvIndex}` : null
              }
            />
            <Metric label="能见度" value={todayWeather.Visibility} />
          </tr>
          <tr>
            <Metric
              label="日出 / 日落"
              value={`${todayWeather.Sunrise} / ${todayWeather.Sunset}`}
            />
            <Metric label="气压" value={todayWeather.Pressure} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WeatherTips({ weatherTip }) {
  const tips = parseWeatherTips(weatherTip);

  if (tips.length === 0) {
    return null;
  }

  return (
    <div style={styles.card}>
      <SectionLabel>Notes</SectionLabel>
      {tips.map((tip) => (
        <div
          key={tip.label}
          style={{ padding: "10px 0", borderTop: "1px solid #eee7da" }}
        >
          <p
            style={{
              margin: "0 0 4px",
              color: "#252a2e",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {tip.label}
          </p>
          <p
            style={{
              margin: 0,
              color: "#667069",
              fontSize: "13px",
              lineHeight: "21px",
            }}
          >
            {tip.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function Forecast({ items = [] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div style={styles.card}>
      <SectionLabel>Next 3 Days</SectionLabel>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          {items.map((item) => {
            const color =
              pollutionColors[item.PollutionLevel] ?? pollutionColors.level_1;

            return (
              <tr key={`${item.Day}-${item.WeatherText}`}>
                <td
                  width="52"
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid #eee7da",
                    color: "#252a2e",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {item.Day}
                </td>
                <td
                  width="40"
                  style={{ padding: "12px 0", borderTop: "1px solid #eee7da" }}
                >
                  <img
                    src={item.WeatherImgUrl}
                    alt="天气"
                    width="28"
                    height="28"
                    style={{ display: "block" }}
                  />
                </td>
                <td
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid #eee7da",
                    color: "#4b5563",
                    fontSize: "13px",
                  }}
                >
                  {item.WeatherText}
                </td>
                <td
                  align="right"
                  width="108"
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid #eee7da",
                    color: "#252a2e",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {item.TempMin} / {item.TempMax}
                </td>
                <td
                  align="right"
                  width="70"
                  style={{
                    padding: "12px 0",
                    borderTop: "1px solid #eee7da",
                    color,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {item.Pollution.replace("空气", "")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OneSection({ one }) {
  if (!one) {
    return null;
  }

  return (
    <div style={{ ...styles.card, marginBottom: 0 }}>
      <SectionLabel>One</SectionLabel>
      {one.imgUrl && (
        <img
          src={one.imgUrl}
          alt="ONE"
          width="590"
          style={{
            width: "100%",
            maxHeight: "300px",
            objectFit: "cover",
            borderRadius: "12px",
            display: "block",
          }}
        />
      )}
      <p
        style={{
          margin: "14px 0 6px",
          color: "#8a8172",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        {one.type}
      </p>
      <p
        style={{
          margin: "0 auto",
          maxWidth: "92%",
          color: "#374151",
          fontSize: "15px",
          lineHeight: "26px",
          textAlign: "center",
        }}
      >
        {one.text}
      </p>
    </div>
  );
}

export function EmailTemplate({
  lastDay,
  todaystr,
  todayOneData,
  weatherTip,
  threeDaysData = [],
}) {
  const todayWeather = threeDaysData[0];

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <title>风也温柔，今日也想你</title>
      </head>
      <body style={styles.body}>
        <div
          style={{
            display: "none",
            overflow: "hidden",
            lineHeight: "1px",
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          第 {lastDay} 天，{todayWeather?.WeatherText ?? "今日天气"}，
          {todayWeather?.Temperature ?? "温度待更新"}
        </div>
        <div style={styles.container}>
          <Header
            lastDay={lastDay}
            todaystr={todaystr}
            todayWeather={todayWeather}
          />
          <div style={styles.content}>
            <WeatherSummary todayWeather={todayWeather} />
            <WeatherMetrics todayWeather={todayWeather} />
            <WeatherTips weatherTip={weatherTip} />
            <Forecast items={threeDaysData} />
            <OneSection one={todayOneData} />
          </div>
        </div>
      </body>
    </html>
  );
}

export function renderEmailTemplate(data) {
  return render(<EmailTemplate {...data} />);
}
