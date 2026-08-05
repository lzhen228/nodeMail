import React from "react";
import { render } from "@react-email/render";

const pollutionColors = {
  level_1: "#52c41a",
  level_2: "#faad14",
  level_3: "#fa8c16",
  level_4: "#f5222d",
  level_5: "#722ed1",
  level_6: "#a8071a",
};

const pollutionBadgeStyles = {
  level_1: { backgroundColor: "#d4edda", color: "#155724" },
  level_2: { backgroundColor: "#fff3cd", color: "#856404" },
  level_3: { backgroundColor: "#ffe5b4", color: "#cc8800" },
  level_4: { backgroundColor: "#f8d7da", color: "#721c24" },
  level_5: { backgroundColor: "#e7d6f8", color: "#5f52a0" },
  level_6: { backgroundColor: "#f5c6cb", color: "#631541" },
};

const aqiScale = [
  { range: "0~50", label: "优", color: "#52c41a" },
  { range: "51~100", label: "良", color: "#faad14" },
  { range: "101~150", label: "轻度污染", color: "#fa8c16" },
  { range: "151~200", label: "中度污染", color: "#f5222d" },
  { range: "201~300", label: "重度污染", color: "#722ed1" },
  { range: "301~500", label: "严重污染", color: "#a8071a" },
];

const styles = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "#ffecd2",
    backgroundImage: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  },
  container: {
    maxWidth: "600px",
    margin: "20px auto",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  },
  header: {
    padding: "30px 20px",
    textAlign: "center",
    color: "#ffffff",
    backgroundColor: "#667eea",
    backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  loveDays: {
    margin: 0,
    fontSize: "18px",
    lineHeight: "26px",
  },
  daysNumber: {
    margin: "10px 0",
    fontSize: "48px",
    fontWeight: 700,
    lineHeight: "56px",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
  },
  dateInfo: {
    margin: 0,
    fontSize: "16px",
    opacity: 0.9,
  },
  content: {
    padding: "20px",
  },
  sectionTitle: {
    margin: "20px 0 15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #667eea",
    color: "#333333",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: "28px",
  },
  todayWeather: {
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "15px",
    backgroundColor: "#a8edea",
    backgroundImage: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  weatherTips: {
    padding: "15px",
    margin: "15px 0",
    borderLeft: "4px solid #ffc107",
    borderRadius: "8px",
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  airQualitySection: {
    padding: "15px",
    margin: "15px 0",
    borderRadius: "12px",
    backgroundColor: "#e0f7fa",
    backgroundImage: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
    textAlign: "center",
  },
  oneSection: {
    padding: "30px 20px",
    marginTop: "20px",
    borderRadius: "15px",
    textAlign: "center",
    backgroundColor: "#ffecd2",
    backgroundImage: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
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
    .slice(0, 8);
}

function Header({ lastDay, todaystr }) {
  return (
    <div style={styles.header}>
      <p style={styles.loveDays}>❤️ 今天是我们在一起的第</p>
      <p style={styles.daysNumber}>{lastDay}</p>
      <p style={styles.loveDays}>天 ❤️</p>
      <p style={styles.dateInfo}>{todaystr}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={styles.sectionTitle}>{children}</h2>;
}

function TodayWeather({ todayWeather }) {
  if (!todayWeather) {
    return null;
  }

  return (
    <>
      <SectionTitle>☀️ 今日天气</SectionTitle>
      <div style={styles.todayWeather}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
          <tbody>
            <tr>
              <td style={{ verticalAlign: "middle" }}>
                <table cellPadding="0" cellSpacing="0" role="presentation">
                  <tbody>
                    <tr>
                      <td width="75" style={{ verticalAlign: "middle" }}>
                        {todayWeather.WeatherImgUrl && (
                          <img
                            src={todayWeather.WeatherImgUrl}
                            alt="天气图标"
                            width="60"
                            height="60"
                            style={{ display: "block", marginRight: "15px" }}
                          />
                        )}
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <p
                          style={{
                            margin: 0,
                            color: "#333333",
                            fontSize: "24px",
                            fontWeight: 600,
                            lineHeight: "32px",
                          }}
                        >
                          {todayWeather.WeatherText}
                        </p>
                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#555555",
                            fontSize: "14px",
                            lineHeight: "20px",
                          }}
                        >
                          💨 {todayWeather.WindDirection}{" "}
                          {todayWeather.WindLevel}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td
                align="right"
                style={{
                  verticalAlign: "middle",
                  color: "#ff6b6b",
                  fontSize: "28px",
                  fontWeight: 700,
                  lineHeight: "36px",
                  whiteSpace: "nowrap",
                }}
              >
                {todayWeather.Temperature}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function AirQuality({ todayWeather }) {
  if (!todayWeather || Number(todayWeather.AQI) <= 0) {
    return null;
  }

  const pollutionColor =
    pollutionColors[todayWeather.PollutionLevel] ?? pollutionColors.level_1;
  const badgeStyle =
    pollutionBadgeStyles[todayWeather.PollutionLevel] ??
    pollutionBadgeStyles.level_1;

  return (
    <div style={styles.airQualitySection}>
      <p style={{ margin: "0 0 8px", color: "#666666", fontSize: "14px" }}>
        🌫️ 空气质量指数
      </p>
      <p
        style={{
          margin: "8px 0",
          color: pollutionColor,
          fontSize: "36px",
          fontWeight: 700,
          lineHeight: "44px",
        }}
      >
        {todayWeather.AQI}
      </p>
      <p
        style={{
          display: "inline-block",
          margin: "8px 0 14px",
          padding: "6px 16px",
          borderRadius: "20px",
          fontSize: "16px",
          fontWeight: 600,
          ...badgeStyle,
        }}
      >
        {todayWeather.Pollution.replace("空气", "")}
      </p>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            {aqiScale.map((item) => (
              <td
                key={item.range}
                width="16.66%"
                style={{
                  padding: "15px 4px 0",
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  verticalAlign: "top",
                }}
              >
                <div
                  style={{
                    padding: "6px 4px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 3px",
                      color: item.color,
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: "16px",
                    }}
                  >
                    {item.range}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "#666666",
                      fontSize: "11px",
                      lineHeight: "15px",
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              </td>
            ))}
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
    <div style={styles.weatherTips}>
      <p
        style={{
          margin: "0 0 10px",
          color: "#856404",
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: "22px",
        }}
      >
        💡 温馨提示
      </p>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          {Array.from({ length: Math.ceil(tips.length / 2) }).map(
            (_, rowIndex) => (
              <tr key={rowIndex}>
                {[tips[rowIndex * 2], tips[rowIndex * 2 + 1]].map(
                  (tip, index) => (
                    <td
                      key={tip?.label ?? index}
                      width="50%"
                      style={{ padding: "6px", verticalAlign: "top" }}
                    >
                      {tip && (
                        <div
                          style={{
                            minHeight: "92px",
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 5px",
                              color: "#856404",
                              fontSize: "13px",
                              fontWeight: 600,
                              lineHeight: "18px",
                            }}
                          >
                            {tip.label}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              color: "#666666",
                              fontSize: "12px",
                              lineHeight: "17px",
                            }}
                          >
                            {tip.value}
                          </p>
                        </div>
                      )}
                    </td>
                  ),
                )}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function Forecast({ items = [] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <SectionTitle>📅 未来天气</SectionTitle>
      <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          {items.map((item, index) => {
            const badgeStyle =
              pollutionBadgeStyles[item.PollutionLevel] ??
              pollutionBadgeStyles.level_1;

            return (
              <tr key={`${item.Day}-${item.WeatherText}`}>
                <td
                  width="60"
                  style={{
                    padding: "15px",
                    borderTop: "10px solid #ffffff",
                    borderRadius: "12px 0 0 12px",
                    backgroundColor: index === 0 ? "#ffecd2" : "#f8f9fa",
                    color: "#333333",
                    fontSize: "16px",
                    fontWeight: 600,
                    verticalAlign: "middle",
                  }}
                >
                  {item.Day}
                </td>
                <td
                  width="40"
                  style={{
                    padding: "15px 0",
                    borderTop: "10px solid #ffffff",
                    backgroundColor: index === 0 ? "#ffecd2" : "#f8f9fa",
                    verticalAlign: "middle",
                  }}
                >
                  <img
                    src={item.WeatherImgUrl}
                    alt="天气"
                    width="40"
                    height="40"
                    style={{ display: "block" }}
                  />
                </td>
                <td
                  style={{
                    padding: "15px 10px",
                    borderTop: "10px solid #ffffff",
                    backgroundColor: index === 0 ? "#ffecd2" : "#f8f9fa",
                    color: "#333333",
                    fontSize: "14px",
                    verticalAlign: "middle",
                  }}
                >
                  {item.WeatherText}
                </td>
                <td
                  align="right"
                  width="100"
                  style={{
                    padding: "15px 10px",
                    borderTop: "10px solid #ffffff",
                    backgroundColor: index === 0 ? "#ffecd2" : "#f8f9fa",
                    color: "#495057",
                    fontSize: "14px",
                    fontWeight: 600,
                    verticalAlign: "middle",
                  }}
                >
                  {item.Temperature}
                </td>
                <td
                  align="right"
                  width="86"
                  style={{
                    padding: "15px",
                    borderTop: "10px solid #ffffff",
                    borderRadius: "0 12px 12px 0",
                    backgroundColor: index === 0 ? "#ffecd2" : "#f8f9fa",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      ...badgeStyle,
                    }}
                  >
                    {item.Pollution}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function OneSection({ one }) {
  if (!one) {
    return null;
  }

  return (
    <>
      <SectionTitle>📖 ONE · 一个</SectionTitle>
      <div style={styles.oneSection}>
        {one.imgUrl && (
          <img
            src={one.imgUrl}
            alt="ONE"
            width="590"
            style={{
              width: "100%",
              borderRadius: "12px",
              display: "block",
              margin: "15px 0",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
            }}
          />
        )}
        <p
          style={{
            margin: "14px 0 6px",
            color: "#999999",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {one.type}
        </p>
        <p
          style={{
            margin: "0 auto",
            maxWidth: "90%",
            color: "#555555",
            fontSize: "15px",
            fontStyle: "italic",
            lineHeight: "27px",
            textAlign: "center",
          }}
        >
          {one.text}
        </p>
      </div>
    </>
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
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
        />
        <title>每日爱的问候</title>
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
          <Header lastDay={lastDay} todaystr={todaystr} />
          <div style={styles.content}>
            <TodayWeather todayWeather={todayWeather} />
            <AirQuality todayWeather={todayWeather} />
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
