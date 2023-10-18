import moment from 'moment';

export const timestampToAge = (timestamp: string | number): string => {
  if (!timestamp) return 'NA';
  const date = moment.unix(+timestamp);
  return date.format('YYYY-MM-DD HH:mm:ss');
};

export const timestampToDate = (timestamp: string | number): string => {
  if (!timestamp) return 'NA';
  const date = moment.unix(+timestamp);
  return date.format('YYYY-MM-DD HH:mm:ss');
};
