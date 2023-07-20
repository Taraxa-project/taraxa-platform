export type ToastData = {
  display: boolean;
  variant?: 'success' | 'error' | 'warning' | undefined;
  text?: string;
};

export type EventData = {
  address: string;
  data: string;
  logIndex: number;
  name: string;
  params: any[];
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
};
