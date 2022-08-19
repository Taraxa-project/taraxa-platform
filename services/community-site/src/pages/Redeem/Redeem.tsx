import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BaseCard, Button, Loading, Notification } from '@taraxa_project/taraxa-ui';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import moment from 'moment';

import WhiteCheckIcon from '../../assets/icons/checkWhite';
import NotFoundIcon from '../../assets/icons/notFound';
import RedeemSidebar from '../../assets/icons/redeemSidebar';
import GreenCircledCheckIcon from '../../assets/icons/greenCircledCheck';
import useRedeem, { Claim, ClaimData, ClaimResponse } from '../../services/useRedeem';
import { weiToEth, formatEth, roundEth } from '../../utils/eth';

import useToken from '../../services/useToken';
import useClaim from '../../services/useClaim';
import useApi from '../../services/useApi';

import Title from '../../components/Title/Title';

import './redeem.scss';
import useCMetamask from '../../services/useCMetamask';
import RedeemModals from './Modal/Modals';

const EmptyRewards = () => (
  <TableRow className="tableRow">
    <TableCell colSpan={4} className="tableCell">
      <div className="noRewardContainer">
        <span className="noRewardText">
          <NotFoundIcon />
          <br />
          Looks like you haven’t received any rewards yet...
        </span>
      </div>
    </TableCell>
  </TableRow>
);

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

  const [isWarnOpen, setWarnOpen] = useState<boolean>(false);
  const [underClaim, setUnderClaim] = useState<number>(0);

  useEffect(() => {
    const getClaimData = async (account: string) => {
      setLoadingClaims(true);
      try {
        const data = await api.post(
          `${process.env.REACT_APP_API_CLAIM_HOST}/accounts/${account}`,
          {},
        );
        if (data.success) {
          setAvailableToBeClaimed(ethers.BigNumber.from(`${data.response.availableToBeClaimed}`));
          setLocked(ethers.BigNumber.from(`${data.response.totalLocked}`));
          setClaimed(ethers.BigNumber.from(`${data.response.totalClaimed}`));
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
    };
    if (account) {
      getClaimData(account);
    }
  }, [account]);

  useEffect(() => {
    const loadClaims = async (account: string) => {
      try {
        const claimData = await api.get(
          `${process.env.REACT_APP_API_CLAIM_HOST}/accounts/claims/${account}`,
          undefined,
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
      loadClaims(account);
    }
  }, [account, availableToBeClaimed]);

  useEffect(() => {
    const getTokenBalance = async () => {
      if (!token || !account) {
        return;
      }
      try {
        const balance = await token.balanceOf(account);
        setTokenBalance(balance);
      } catch (error) {
        setTokenBalance(ethers.BigNumber.from('0'));
      }
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

  const columns = ['TARA', 'Date', 'Status', ''];

  return (
    <div className="redeem">
      {isWarnOpen && (
        <RedeemModals
          taraAmount={claims[underClaim].numberOfTokens}
          warningModal={isWarnOpen}
          onWarningModalClose={() => setWarnOpen(false)}
          onWarningModalAccept={() => onClaim(underClaim)}
        />
      )}
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
        <div className="tableHeader">
          <WhiteCheckIcon /> <span style={{ marginLeft: '10px' }}>Redemption History</span>
        </div>
        {claims ? (
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
                {claims && claims.length > 0 ? (
                  claims.map((row: Claim, ind: number) => {
                    return (
                      <TableRow className="tableRow" key={ind}>
                        <TableCell className="tableCell">
                          {formatEth(roundEth(weiToEth(row.numberOfTokens)))}
                        </TableCell>
                        <TableCell className="tableCellGrey">
                          {moment(
                            row.claimedAt
                              ? row.claimedAt
                              : row.createdAt
                              ? row.createdAt
                              : Date.now(),
                          )
                            .format('ll')
                            .toUpperCase()}
                        </TableCell>
                        <TableCell className="tableCell">
                          {!row.claimed ? (
                            <div className="container-row">
                              <RedeemSidebar />
                              <div className="redeemable">Not redeemed</div>
                            </div>
                          ) : (
                            <div className="container-row">
                              <GreenCircledCheckIcon />
                              <div className="redeemed">Redeemed</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="tableCell">
                          {!row.claimed && (
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              label="Redeem"
                              disabled={row.numberOfTokens.eq(0) || row.claimed}
                              onClick={() => {
                                setWarnOpen(true);
                                setUnderClaim(claims.indexOf(row));
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <EmptyRewards />
                )}
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
