import { RequestEntity } from '../entity';

export const toUTCDate = (date: Date): Date => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};

export const filterRequestsOfThisWeek = (
  requests: RequestEntity[]
): RequestEntity[] => {
  const utcDate = toUTCDate(new Date());
  const monthDay = utcDate.getDate();
  const weekDay = utcDate.getDay();
  const daysToSunday = 7 - weekDay;
  const daysFromSunday = weekDay;

  const setDateToMidnight = (date: Date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  };
  const maxDate = toUTCDate(new Date());
  maxDate.setDate(monthDay + daysToSunday);
  setDateToMidnight(maxDate);
  const minDate = toUTCDate(new Date());
  minDate.setDate(monthDay - daysFromSunday);
  setDateToMidnight(minDate);

  return requests.filter((req) => {
    const utcReq = toUTCDate(req.createdAt);
    if (
      utcReq.getTime() < maxDate.getTime() &&
      utcReq.getTime() >= minDate.getTime()
    ) {
      return true;
    } else {
      return false;
    }
  });
};
