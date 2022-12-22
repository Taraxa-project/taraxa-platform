import moment from "moment";

const FIRST_EPOCH = moment("2021-10-15T00:00:00Z").utc();

export type Epoch = {
  epoch: number;
  startDate: number;
  endDate: number;
};

export const getEpochs = (currentDate: number): Epoch[] => {
  const getEpoch = (epoch: number, date: moment.Moment) => ({
    epoch,
    startDate: date.startOf("day").unix(),
    endDate: date.endOf("day").add(1, "month").startOf("day").unix() - 1,
  });

  const epochs = [getEpoch(0, FIRST_EPOCH)];
  while (true) {
    const nextEpoch = getEpoch(
      epochs.length,
      moment
        .unix(epochs[epochs.length - 1].startDate)
        .utc()
        .add(1, "month")
    );
    if (nextEpoch.startDate <= currentDate && nextEpoch.endDate > currentDate) {
      break;
    }
    epochs.push(nextEpoch);
  }
  return epochs;
};
