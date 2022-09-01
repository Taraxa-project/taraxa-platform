import { RequestEntity } from '../entity';

export const filterRequestsOfThisWeek = (
  requests: RequestEntity[]
): RequestEntity[] => {
  const monthDay = new Date().getDate();
  const weekDay = new Date().getDay();
  const daysToSunday = 7 - weekDay;
  const daysFromSunday = weekDay;

  const setDateToMidnight = (date: Date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  };
  const maxDate = new Date();
  maxDate.setDate(monthDay + daysToSunday);
  setDateToMidnight(maxDate);
  const minDate = new Date();
  minDate.setDate(monthDay - daysFromSunday);
  setDateToMidnight(minDate);

  return requests.filter((req) => {
    if (
      req.createdAt.getTime() < maxDate.getTime() &&
      req.createdAt.getTime() >= minDate.getTime()
    ) {
      return true;
    } else {
      return false;
    }
  });
};
