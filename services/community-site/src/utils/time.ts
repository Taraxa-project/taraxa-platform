export const formatTime = (seconds: number) => {
  const unit = ['second', 'minute', 'hour', 'day', 'month', 'year'];
  return [1, 60, 60 * 60, 24 * 60 * 60, 30 * 24 * 60 * 60, 365 * 24 * 60 * 60].reduce(
    (prev: string, currVal: number, currIndex: number) => {
      const u = unit[currIndex];
      const decimal = seconds / currVal;

      if (decimal >= 1) {
        const plural = decimal > 1;
        return `${Math.round(decimal)} ${u}${plural ? 's' : ''}`;
      }

      return prev;
    },
    `${seconds}`,
  );
};
