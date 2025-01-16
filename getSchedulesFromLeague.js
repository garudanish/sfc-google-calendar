const { default: axios } = require("axios");
const fs = require("fs");

const SEONGNAM_FC_TEAM_ID = "K08";

const getScheduleList = async ({ leagueId, teamId, year, month }) => {
  const {
    data: { data: { scheduleList = [] } = {} },
  } = await axios.post("https://www.kleague.com/getScheduleList.do", {
    leagueId,
    month,
    teamId,
    year,
  });

  return scheduleList;
};

const getYearSchedule = async ({ leagueId, teamId, year }) => {
  const months = new Array(12)
    .fill(0)
    .map((_, i) => (i + 1).toString().padStart(2, "0")); // ["01", "02", ..., "12"]

  const schedules = await Promise.all(
    months.map((month) =>
      getScheduleList({
        leagueId: "2",
        teamId: SEONGNAM_FC_TEAM_ID,
        year: "2025",
        month,
      })
    )
  ).then((results) => results.flatMap((schedule) => schedule));

  return schedules;
};

(async () => {
  const schedules = await getYearSchedule({
    leagueId: "2",
    teamId: "K08",
    year: "2025",
  });

  console.log(schedules[4]);

  const fixturesTsv = schedules.map(
    ({
      roundId,
      gameDate,
      gameTime,
      homeTeam,
      homeTeamName,
      awayTeamName,
      fieldNameFull,
    }) => {
      const [, month, day] = gameDate.split(".").map(Number);
      const homeOrAway = homeTeam === SEONGNAM_FC_TEAM_ID ? "H" : "A";

      return [
        roundId,
        homeOrAway === "H" ? awayTeamName : homeTeamName,
        homeOrAway,
        month,
        day,
        gameTime,
        fieldNameFull,
      ].join("\t");
    }
  );

  fs.writeFileSync("2025.tsv", fixturesTsv.join("\n"));
})();
