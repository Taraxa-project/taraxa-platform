export const formatValidatorName = (name: string) => {
  if (name.length <= 17) {
    return name;
  }
  return `${name.substr(0, 7)} ... ${name.substr(-5)}`;
};
