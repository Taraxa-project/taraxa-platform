/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, SyntheticEvent, useState } from 'react';
import { Box, Tab } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import { TableTabsProps, TabPanelProps, TabModel } from '../../models';

const TabPanel: FC<TabPanelProps> = ({
  index,
  value,
  children,
}: TabPanelProps) => {
  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {children}
    </Box>
  );
};

const a11yProps = (index: string | number) => {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
};

export const TableTabs: FC<TableTabsProps> = ({
  tabs,
  initialValue,
}: TableTabsProps) => {
  const [value, setValue] = useState<string | number>(initialValue);
  const handleChange = (event: SyntheticEvent, newValue: string | number) => {
    setValue(newValue);
  };

  return (
    <Box width='100%'>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label='icon position tabs example'
        indicatorColor='secondary'
      >
        {tabs?.length &&
          tabs.map((tab: TabModel) => (
            <Tab
              key={`${tab.label}-${tab.index}}`}
              icon={tab.icon}
              iconPosition={tab.iconPosition}
              label={tab.label}
              {...a11yProps(tab.index)}
            />
          ))}
      </Tabs>
      {tabs?.length &&
        tabs.map((tab: TabModel) => (
          <TabPanel
            value={value}
            index={tab.index}
            key={`${tab.label}-${tab.index}}`}
          >
            {tab?.children}
          </TabPanel>
        ))}
    </Box>
  );
};
