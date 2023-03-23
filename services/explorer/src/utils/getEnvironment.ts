import { ENVIRONMENT } from './Enums';

export const getEnvironment = () => {
  const currentUrl = window.location.href;
  let currentEnv;
  if (currentUrl.includes('localhost')) {
    currentEnv = ENVIRONMENT.LOCALHOST;
  } else if (currentUrl.includes('qa.explorer.taraxa.io')) {
    currentEnv = ENVIRONMENT.QA;
  } else {
    currentEnv = ENVIRONMENT.PROD;
  }
  return currentEnv;
};
