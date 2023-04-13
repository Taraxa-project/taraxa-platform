export const formatTime = (seconds: number) => {
  const unit = ['second', 'minute', 'hour', 'day', 'month', 'year'];
  return [1, 60, 60 * 60, 24 * 60 * 60, 30 * 24 * 60 * 60, 365 * 24 * 60 * 60].reduce(
    (prev: string, currVal: number, currIndex: number) => {
      const u = unit[currIndex];
      const decimal = seconds / currVal;

      if (decimal >= 1) {
        const rounded = Math.round(decimal);
        const plural = rounded > 1;
        return `${rounded} ${u}${plural ? 's' : ''}`;
      }

      return prev;
    },
    `${seconds}`,
  );
};

export const blocksToDays = (targetBlock: number, currentBlock: number): string => {
  const blockTime = (targetBlock - currentBlock) * 4;
  let blockTimeInHours = blockTime / (60 * 60);
  const blockTimeDays = Math.floor(blockTimeInHours / 24);
  if (blockTimeDays > 0) {
    blockTimeInHours %= 24;
  }
  return `${blockTimeDays && `${blockTimeDays.toFixed(0)} days`} ${blockTimeInHours.toFixed(
    0,
  )} hours`;
};

export default formatTime;
