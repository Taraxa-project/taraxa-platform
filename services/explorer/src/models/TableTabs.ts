export interface TabModel {
  label: string;
  index: string | number;
  icon?: JSX.Element;
  iconPosition?: 'start' | 'end' | 'bottom';
  children: React.ReactNode;
}

export interface TabPanelProps {
  index: string | number;
  value: string | number;
  children: React.ReactNode;
}

export interface TableTabsProps {
  tabs: TabModel[];
  initialValue: string | number;
  setTabsStep?: (step: number) => void;
}
