export const calculateYieldFor = (amount: number, seconds: number) => {
  const yearlyReward = (amount * 20) / 100;
  const perSeconds = yearlyReward / (365.2425 * 24 * 60 * 60);
  return seconds * perSeconds;
};
