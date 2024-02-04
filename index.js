const { addHours, format } = require("date-fns");
const fs = require("fs");
const { google } = require("googleapis");
const { authorize } = require("./getAuth");
const fixtures = fs.readFileSync("2024.csv", "utf8");

const calendarId = "YOUR_CALENDAR_ID";

const jsonToEvent = ({
  round,
  team,
  homeOrAway,
  month,
  day,
  hour,
  location,
}) => {
  const startTimeRaw = `2024-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}T${hour}:00`;
  const startTimeDate = new Date(startTimeRaw);
  const endTimeDate = addHours(startTimeDate, 2);

  const startTimeDateTime = format(startTimeDate, "yyyy-MM-dd'T'HH:mm:ss", {
    timeZone: "Asia/Seoul",
  });

  const endTimeDateTime = format(endTimeDate, "yyyy-MM-dd'T'HH:mm:ss", {
    timeZone: "Asia/Seoul",
  });

  const isHome = homeOrAway === "H";

  const description = `2024 K리그2 ${round}R ${isHome ? "성남" : team} vs ${isHome ? team : "성남"}`

  return {
    summary: `${team} ${homeOrAway}`,
    location,
    description,
    start: {
      dateTime: startTimeDateTime,
      timeZone: "Asia/Seoul",
    },
    end: {
      dateTime: endTimeDateTime,
      timeZone: "Asia/Seoul",
    },
  };
};

const fixtureData = fixtures
  .split("\n")
  .map((l) => l.split("\t"))
  .map(([round, team, homeOrAway, month, day, hour, location]) => ({
    round,
    team,
    homeOrAway,
    month,
    day,
    hour,
    location,
  }))
  .map(jsonToEvent);

const addEvent = async (auth) => {
  const calendar = google.calendar({ version: "v3", auth });

  const res = await Promise.all(
    fixtureData.map((event) =>
      calendar.events.insert({
        auth,
        calendarId,
        resource: event,
      })
    )
  );

  console.log(res);
};

(async () => {
  const auth = await authorize();
  await addEvent(auth);
})()
