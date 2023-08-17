import React, { FC } from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import useStyles from './AwardCard.styles';
import { Award } from '../Icons';

export interface AwardCardProps {
  title: string;
  subtitle: string;
  total: number;
  description: string;
}

export const AwardCard: FC<AwardCardProps> = ({
  title,
  subtitle,
  total,
  description,
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} variant='outlined'>
      <CardContent className={classes.cardContent}>
        <Box className={classes.wrapper}>
          <Box className={classes.awardContainer}>
            <Award />
          </Box>
          <Box className={classes.titleContainer}>
            {title && (
              <Typography fontSize='28px' fontWeight='500' color='common.white'>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                mt='19px'
                fontSize='16px'
                fontWeight='400'
                color='text.secondary'
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={classes.detailsContainer}>
          <Typography fontSize='36px' fontWeight='700' color='common.white'>
            {(total || 0)?.toLocaleString('en-US')}
          </Typography>
          {description && (
            <Typography
              fontSize='18px'
              mt='4px'
              fontWeight='400'
              color='common.white'
            >
              {description}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
