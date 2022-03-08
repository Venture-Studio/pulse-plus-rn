import moment from "moment";

export function FormatSleepData(data: any) {
  data.sort((a: any, b: any) => {
    if (a.endDate > b.endDate) {
      return 1;
    } else return -1;
  });

  const newObj: { [key: string]: any } = {};
  data.map((item: any) => {
    const day: any = moment(item.endDate).startOf("day");
    if (day in newObj) {
      newObj[day].bedtime_stop = item.endDate;
      const duration = moment(item.endDate).diff(
        moment(item.startDate),
        "seconds"
      );
      if (item.value === "INBED") {
        newObj[day].awake = newObj[day].awake + duration;
      } else {
        newObj[day].total = newObj[day].total + duration;
        newObj[day].deep = newObj[day].deep + duration;
      }
    } else {
      newObj[day] = {};
      newObj[day].bedtime_start = item.startDate;
      newObj[day].bedtime_stop = item.endDate;
      const duration = moment(item.endDate).diff(
        moment(item.startDate),
        "seconds"
      );
      if (item.value === "INBED") {
        newObj[day].awake = duration;
        newObj[day].total = 0;
        newObj[day].deep = 0;
      } else {
        newObj[day].total = duration;
        newObj[day].deep = duration;
        newObj[day].awake = 0;
      }
      newObj[day].light = 0;
      newObj[day].rem = 0;
    }
  });
  return newObj;
}

export function FormatActivityData(steps: any, active: any, basal: any) {
  steps.sort((a: any, b: any) => {
    if (a.startDate > b.startDate) {
      return 1;
    } else return -1;
  });

  active.sort((a: any, b: any) => {
    if (a.startDate > b.startDate) {
      return 1;
    } else return -1;
  });

  basal.sort((a: any, b: any) => {
    if (a.startDate > b.startDate) {
      return 1;
    } else return -1;
  });

  const newObj: { [key: string]: any } = {};
  steps.map((item: any) => {
    const day: any = moment(item.startDate).startOf("day").toISOString();
    if (day in newObj) {
      newObj[day].steps = (newObj[day]?.steps ?? 0) + item.value;
    } else {
      newObj[day] = {};
      newObj[day].date = day;
      newObj[day].steps = item.value;
      newObj[day].calories_active = 0;
      newObj[day].calories_total = 0;
    }
  });

  basal.map((item: any) => {
    const day: any = moment(item.startDate).startOf("day").toISOString();
    if (day in newObj) {
      newObj[day].calories_total =
        (newObj[day]?.calories_total ?? 0) + item.value;
    } else {
      newObj[day] = {};
      newObj[day].date = day;
      newObj[day].steps = 0;
      newObj[day].calories_total =
        (newObj[day]?.calories_total ?? 0) + item.value;
      newObj[day].calories_active = 0;
    }
  });

  active.map((item: any) => {
    const day: any = moment(item.startDate).startOf("day").toISOString();
    if (day in newObj) {
      newObj[day].calories_total =
        (newObj[day]?.calories_total ?? 0) + item.value;
      newObj[day].calories_active =
        (newObj[day]?.calories_active ?? 0) + item.value;
    } else {
      newObj[day] = {};
      newObj[day].date = day;
      newObj[day].steps = 0;
      newObj[day].calories_total =
        (newObj[day]?.calories_total ?? 0) + item.value;
      newObj[day].calories_active =
        (newObj[day]?.calories_active ?? 0) + item.value;
    }
  });

  console.log("formated steps", newObj);
  return newObj;
}
