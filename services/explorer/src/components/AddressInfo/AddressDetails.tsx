import clsx from 'clsx';
import { toSvg } from 'jdenticon';
import {
  Box,
  Grid,
  Typography,
  CopyTo,
  Loading,
} from '@taraxa_project/taraxa-ui';
import { zeroX } from '../../utils';
import useStyles from './AddressDetails.styles';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { DataRow } from '../DataRow';
import { AddressLabel } from '../AddressLabel';
import { AddressInfoDetails } from '../../models';

export interface AddressInfoProps {
  details: AddressInfoDetails;
  isFetchingAddressStats: boolean;
  isLoadingAddressStats: boolean;
}

export const AddressDetails = ({
  details,
  isFetchingAddressStats,
  isLoadingAddressStats,
}: AddressInfoProps): JSX.Element => {
  const classes = useStyles();
  const addressIcon = toSvg(details?.address, 40, { backColor: '#fff' });
  const onCopy = useCopyToClipboard();

  return (
    <>
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='flex-start'
        flexWrap='wrap'
        gap='2rem'
        mt={3}
      >
        <div
          className={classes.iconContainer}
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{ __html: addressIcon }}
        />
        <Typography
          variant='h6'
          style={{ fontWeight: 'bold', wordBreak: 'break-all' }}
        >
          {zeroX(details?.address)}
        </Typography>
        <CopyTo text={zeroX(details?.address)} onCopy={onCopy} />
      </Box>
      <Box className={classes.twoColumnFlex}>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='left'
          gap='1.5rem'
        >
          {details?.label && (
            <DataRow
              title='Label'
              data={<AddressLabel label={details?.label} />}
            />
          )}
          <DataRow
            title='Balance'
            data={`${details?.balance ? details?.balance : '0'} TARA`}
          />
          {details?.value &&
            details?.valueCurrency &&
            details?.pricePerTara && (
              <DataRow
                title='Value'
                data={`${details.value} ${details.valueCurrency} ( ${details.pricePerTara} / TARA )`}
              />
            )}
        </Box>
        <div style={{ maxWidth: '320px' }}>
          <Grid container gap={1}>
            <Grid
              item
              xs={12}
              className={clsx(classes.gridHeader, classes.fullWidthHeader)}
            >
              BLOCKS PRODUCED:
            </Grid>
            <Grid className={classes.blocksBox} item>
              {isFetchingAddressStats || isLoadingAddressStats ? (
                <Loading />
              ) : (
                <div>{details?.dagBlocks}</div>
              )}
              <span>#DAG Blocks</span>
            </Grid>
            <Grid className={classes.blocksBox} item>
              {isFetchingAddressStats || isLoadingAddressStats ? (
                <Loading />
              ) : (
                <div>{details?.pbftBlocks}</div>
              )}

              <span>#PBFT Blocks</span>
            </Grid>
          </Grid>
        </div>
      </Box>
    </>
  );
};
