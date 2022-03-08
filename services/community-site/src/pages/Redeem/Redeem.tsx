import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BaseCard, Button, Notification } from '@taraxa_project/taraxa-ui';
import { useMetaMask } from 'metamask-react';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import moment from 'moment';
import { weiToEth, formatEth, roundEth } from '../../utils/eth';

import useToken from '../../services/useToken';
import useClaim from '../../services/useClaim';
import useApi from '../../services/useApi';

import Title from '../../components/Title/Title';

import './redeem.scss';

interface ClaimData {
  availableToBeClaimed: string;
  nonce: number;
  hash: string;
}
interface ClaimResponse {
  tokens: string;
  availableToBeClaimed: string;
  date: string;
  status: number;
}

function Redeem() {
  const { status, account } = useMetaMask();
  const token = useToken();
  const claim = useClaim();
  const api = useApi();

  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [availableToBeClaimed, setAvailableToBeClaimed] = useState<ethers.BigNumber>(
    ethers.BigNumber.from('0'),
  );
  const [locked, setLocked] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [claimed, setClaimed] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));

  useEffect(() => {
    const getClaimData = async (account: string) => {
      const data = await api.post(
        `${process.env.REACT_APP_API_CLAIM_HOST}/accounts/${account}`,
        {},
      );
      if (data.success) {
        setAvailableToBeClaimed(ethers.BigNumber.from(data.response.availableToBeClaimed));
        setLocked(ethers.BigNumber.from(data.response.totalLocked));
        setClaimed(ethers.BigNumber.from(data.response.totalClaimed));
      } else {
        setAvailableToBeClaimed(ethers.BigNumber.from('0'));
        setLocked(ethers.BigNumber.from('0'));
        setClaimed(ethers.BigNumber.from('0'));
      }
    };
    if (account) {
      getClaimData(account);
    }
  }, [account]);

  useEffect(() => {
    const getTokenBalance = async () => {
      if (!token) {
        return;
      }

      const balance = await token.balanceOf(account);
      setTokenBalance(balance);
    };

    getTokenBalance();
  }, [account, token]);

  const onClaim = async () => {
    if (!claim) {
      return;
    }

    try {
      const claimData = await api.post<ClaimData>(
        `${process.env.REACT_APP_API_CLAIM_HOST}/claims/${account}`,
        {},
      );
      if (claimData.success) {
        const { availableToBeClaimed, nonce, hash } = claimData.response;
        const claimTx = await claim.claim(account, availableToBeClaimed, nonce, hash);

        await claimTx.wait(1);

        setAvailableToBeClaimed(ethers.BigNumber.from('0'));
        setClaimed((currentClaimed) =>
          currentClaimed.add(ethers.BigNumber.from(availableToBeClaimed)),
        );
        setTokenBalance((balance) => balance.add(ethers.BigNumber.from(availableToBeClaimed)));
      }
    } catch (e) {}
  };

  const columns = ['TARA', 'Lifetime points redeemed', 'Date', 'Status'];
  const rows = [
    {
      tokens: '500',
      availableToBeClaimed: '1,350,241',
      date: Date.now().toString(),
      status: 0,
    } as ClaimResponse,
  ];

  return (
    <div className="container">
      <div className="claim">
        <div className="claim-content">
          <Title
            title="Redeem TARA Points"
            subtitle="Earn rewards and help test &amp; secure the Taraxa’s network"
          />
          <div className="notification">
            <Notification
              title="Info:"
              text="We release the rewards once a month, usually on the 15th."
              variant="info"
            />
          </div>
          {status !== 'connected' && (
            <div className="notification">
              <Notification
                title="Notice:"
                text="You are not connected to the Metamask wallet"
                variant="danger"
              />
            </div>
          )}
          <div className="cardContainer">
            <BaseCard
              title={formatEth(roundEth(weiToEth(availableToBeClaimed)))}
              description="TARA points"
            />
            <BaseCard
              title={formatEth(roundEth(weiToEth(claimed)))}
              description="TARA claimed total"
            />
            <BaseCard
              title={formatEth(roundEth(weiToEth(tokenBalance)))}
              description="Current wallet balance"
            />
          </div>
          <div className="cardContainer">
            <BaseCard title={formatEth(roundEth(weiToEth(locked)))} description="Locked" />
          </div>
        </div>
      </div>
      {rows.length > 0 && (
        <TableContainer className="table">
          <Table className="table">
            <TableHead>
              <TableRow className="tableHeadRow">
                {columns.map((col, ind) => (
                  <TableCell className="tableHeadCell" key={ind}>
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: ClaimResponse, ind: number) => (
                <TableRow className="tableRow" key={ind}>
                  <TableCell className="tableCell">{row.tokens}</TableCell>
                  <TableCell className="tableCell">{row.availableToBeClaimed}</TableCell>
                  <TableCell className="tableCell">{moment().format('ll').toUpperCase()}</TableCell>
                  <TableCell className="tableCell">
                    {row.status !== 1 ? (
                      <Button
                        disabled={availableToBeClaimed.eq('0')}
                        variant="outlined"
                        color="secondary"
                        onClick={onClaim}
                        label="Redeem"
                        size="small"
                      />
                    ) : (
                      'Redeemed'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default Redeem;
