import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BaseCard, Button, Loading, Notification } from '@taraxa_project/taraxa-ui';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import moment from 'moment';

import useRedeem, { Claim, ClaimData, ClaimResponse } from '../../services/useRedeem';
import { weiToEth, formatEth, roundEth } from '../../utils/eth';

import useToken from '../../services/useToken';
import useClaim from '../../services/useClaim';
import useApi from '../../services/useApi';

import Title from '../../components/Title/Title';

import './redeem.scss';
import useCMetamask from '../../services/useCMetamask';

function Redeem() {
  const { status, account } = useCMetamask();
  const token = useToken();
  const claim = useClaim();
  const api = useApi();
  const redeem = useRedeem();

  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [availableToBeClaimed, setAvailableToBeClaimed] = useState<ethers.BigNumber>(
    ethers.BigNumber.from('0'),
  );
  const [locked, setLocked] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [claimed, setClaimed] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [isLoadingClaims, setLoadingClaims] = useState<boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const getClaimData = async (account: string) => {
      setLoadingClaims(true);
      try {
        const data = await api.post(
          `${process.env.REACT_APP_API_CLAIM_HOST}/accounts/${ethers.utils.getAddress(account)}`,
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
      } catch (error) {
        setAvailableToBeClaimed(ethers.BigNumber.from('0'));
        setLocked(ethers.BigNumber.from('0'));
        setClaimed(ethers.BigNumber.from('0'));
      }

      try {
        const claimData = await api.get(
          `${process.env.REACT_APP_API_CLAIM_HOST}/claims/accounts/${account}`,
          {},
        );

        if (claimData.success) {
          const finalClaims = redeem.formatClaimsForTable(
            claimData.response.data,
            account,
            availableToBeClaimed,
          );
          setClaims(finalClaims);
        } else {
          setClaims([]);
          setLoadingClaims(false);
        }
      } catch (error) {
        setClaims([]);
        setLoadingClaims(false);
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

  const onClaim = async (ind: number) => {
    if (!claim) {
      return;
    }

    try {
      let claimObj: Claim;
      if (ind === 0) {
        const claimData = await api.post<ClaimResponse>(
          `${process.env.REACT_APP_API_CLAIM_HOST}/claims/${account}`,
          {},
        );
        if (claimData && claimData.success) {
          claimObj = redeem.parseClaim(claimData.response);
        } else {
          return;
        }
      } else {
        const clonedClaim = { ...claims[ind] };
        claimObj = clonedClaim;
      }
      if (claimObj) {
        const claimPatchData = await api.patch<ClaimData>(
          `${process.env.REACT_APP_API_CLAIM_HOST}/claims/${claimObj.id}`,
          {},
        );
        if (claimPatchData.success) {
          const { availableToBeClaimed, nonce, hash } = claimPatchData.response;
          const claimTx = await claim.claim(account, availableToBeClaimed, nonce, hash);

          await claimTx.wait(1);

          setAvailableToBeClaimed(ethers.BigNumber.from('0'));
          setClaimed((currentClaimed) =>
            currentClaimed.add(ethers.BigNumber.from(availableToBeClaimed)),
          );
          setTokenBalance((balance) => balance.add(ethers.BigNumber.from(availableToBeClaimed)));
        }
      }
    } catch (e) {}
  };

  const columns = ['TARA', 'Lifetime points redeemed', 'Date', 'Status'];

  return (
    <div className="redeem">
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
        {claims && claims.length > 0 ? (
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
                {claims.map((row: Claim, ind: number) => {
                  return (
                    <TableRow className="tableRow" key={ind}>
                      <TableCell className="tableCell">{row.numberOfTokens}</TableCell>
                      <TableCell className="tableCell">
                        {row.totalClaimed ? row.totalClaimed : '0'}
                      </TableCell>
                      <TableCell className="tableCell">
                        {moment().format('ll').toUpperCase()}
                      </TableCell>
                      <TableCell className="tableCell">
                        {!row.claimed ? (
                          <Button
                            disabled={availableToBeClaimed.toNumber() >= +row.numberOfTokens}
                            variant="outlined"
                            color="secondary"
                            onClick={() => onClaim(claims.indexOf(row))}
                            label="Redeem"
                            size="small"
                          />
                        ) : (
                          'Redeemed'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : isLoadingClaims ? (
          <div className="container-centered">
            <Loading />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Redeem;
