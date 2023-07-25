import { ProgressBar } from '@taraxa_project/taraxa-ui';
import { HoldersTableData } from '../../models';
import { HashLink } from '../../components';
import { HashLinkType } from '../../utils';
import { BigNumber, utils } from 'ethers';

export const toHolderTableRow = ({
  rank,
  address,
  balance,
  totalSupply,
  taraPrice,
}: HoldersTableData): {
  rank: number;
  address: JSX.Element;
  balanceStr: string;
  percentage: JSX.Element;
  value: string;
} => {
  const addressLink = (
    <HashLink linkType={HashLinkType.ADDRESSES} width='auto' hash={address} />
  );
  // We need to multiply by an additional 100 to get some precision back from bignumber
  // Original formula should be balance * 100 / totalSupply
  // But the improved one that returns for smaller holders too is: balance * 100 * 100 / totalSupply
  const _balance = balance.mul(BigNumber.from(10000));
  const percentage = _balance.div(totalSupply);

  // We divide back by 100 to get the floating point percentage
  const divided = Number(percentage) / parseFloat('100');
  const percentageBar = <ProgressBar percentage={divided} />;
  const etherBalance = utils.formatEther(balance);
  const value = `$${(
    Number.parseFloat(etherBalance) * taraPrice
  ).toLocaleString('USD')}`;
  return {
    rank,
    address: addressLink,
    balanceStr: utils.commify(utils.formatEther(balance)),
    percentage: percentageBar,
    value,
  };
};
