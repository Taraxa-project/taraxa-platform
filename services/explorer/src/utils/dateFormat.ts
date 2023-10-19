export const timestampToDate = (timestamp: string | number): string => {
  if (!timestamp) return 'NA';
  const date = new Date(+timestamp * 1000);
  return date.toLocaleString();
};

export const timestampToFormattedTime = (
  timestamp: string | number
): string => {
  if (!timestamp) return 'NA';

  const now = new Date();
  const date = new Date(+timestamp * 1000);

  const timeDifferenceInSeconds = Math.max(
    Math.floor((Number(now) - Number(date)) / 1000),
    0
  );

  if (timeDifferenceInSeconds === 0) {
    return '0 seconds ago';
  } else if (timeDifferenceInSeconds < 60) {
    return `${timeDifferenceInSeconds} second${
      timeDifferenceInSeconds > 1 ? 's' : ''
    } ago`;
  } else if (timeDifferenceInSeconds < 3600) {
    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (timeDifferenceInSeconds < 3600 * 48) {
    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString();
  }
};
