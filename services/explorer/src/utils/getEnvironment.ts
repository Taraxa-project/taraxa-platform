import { ENVIRONMENT } from './Enums';

export const getEnvironment = () => {
  const currentUrl = window.location.href;
  let currentEnv;
  const isLocalhost = currentUrl.includes('localhost');
  const isQa = /^https?:\/\/qa\.explorer\.taraxa\.io/.test(currentUrl);
  if (isLocalhost) {
    currentEnv = ENVIRONMENT.LOCALHOST;
  } else if (isQa) {
    currentEnv = ENVIRONMENT.QA;
  } else {
    currentEnv = ENVIRONMENT.PROD;
  }
  return currentEnv;
};
