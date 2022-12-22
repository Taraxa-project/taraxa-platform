import _ from "lodash";

export interface Period {
  startsAt: number;
  endsAt: number;
}

export const getPeriods = (...points: number[]): Period[] => {
  points = [...points];
  points = [...new Set(points)];
  points = _.sortBy(points);

  const periods: Period[] = [];
  for (let i = 1; i < points.length; i++) {
    const startsAt = points[i - 1];
    const endsAt = points[i] - 1;

    periods.push({
      startsAt,
      endsAt,
    });
  }
  return periods;
};
