import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import moment from 'moment';
import {
  BaseCard,
  Button,
  Label,
  Loading,
  Notification,
  Icons,
  EmptyTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@taraxa_project/taraxa-ui';

import WhiteCheckIcon from '../../assets/icons/checkWhite';
import RedeemSidebar from '../../assets/icons/redeemSidebar';
import useRedeem, { Claim, ClaimData, ClaimResponse } from '../../services/useRedeem';
import { weiToEth, formatEth, roundEth } from '../../utils/eth';

import useClaim from '../../services/useClaim';
import useApi from '../../services/useApi';

import Title from '../../components/Title/Title';

import './redeem.scss';
import useCMetamask from '../../services/useCMetamask';
import RedeemModals from './Modal/Modals';
import useChain from '../../services/useChain';
import useMainnet from '../../services/useMainnet';
import WrongNetwork from '../../components/WrongNetwork';
import { useWalletPopup } from '../../services/useWalletPopup';

function Redeem() {
  const { status, account } = useCMetamask();
  const claim = useClaim();
  const api = useApi();
  const redeem = useRedeem();
  const { chainId, provider } = useChain();
  const { chainId: mainnetChainId } = useMainnet();
  const { asyncCallback } = useWalletPopup();

  const [availableToBeClaimed, setAvailableToBeClaimed] = useState<ethers.BigNumber>(
    ethers.BigNumber.from('0'),
  );
  const [locked, setLocked] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [claimed, setClaimed] = useState<ethers.BigNumber>(ethers.BigNumber.from('0'));
  const [isLoadingClaims, setLoadingClaims] = useState<boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [balance, setBalance] = useState(ethers.BigNumber.from('0'));

  const [isWarnOpen, setWarnOpen] = useState<boolean>(false);
  const [underClaim, setUnderClaim] = useState<number>(0);
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);

  const isOnWrongChain = chainId !== mainnetChainId;

  const fetchBalance = async () => {
    if (status === 'connected' && account && provider) {
      setBalance(await provider.getBalance(account));
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [status, account, chainId, shouldFetch]);

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

          asyncCallback(
            async () => {
              return await claim.claim(account, availableToBeClaimed, nonce, hash, {
                gasLimit: 70000,
              });
            },
            () => {
              setShouldFetch(true);
            },
          );

          setAvailableToBeClaimed(ethers.BigNumber.from('0'));
          setClaimed((currentClaimed) =>
            currentClaimed.add(ethers.BigNumber.from(availableToBeClaimed)),
          );
        }
      }
    } catch (e) {}
  };

  const columns = ['TARA', 'Date', 'Status', ''];

  return (
    <div className="redeem">
      {isWarnOpen && !isOnWrongChain && (
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
                text="We release the rewards once a month, usually on the 20th."
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
            {status === 'connected' && isOnWrongChain && (
              <div className="notification">
                <Notification
                  title="Notice:"
                  text="You need to be connected to the Taraxa Mainnet network"
                  variant="danger"
                >
                  <WrongNetwork />
                </Notification>
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
                title={formatEth(roundEth(weiToEth(balance)))}
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
          <TableContainer className="redeemTable">
            <Table className="redeemTable">
              <TableHead>
                <TableRow>
                  {columns.map((col, ind) => (
                    <TableCell key={ind}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {claims && claims.length > 0 ? (
                  claims.map((row: Claim, ind: number) => {
                    return (
                      <TableRow key={ind}>
                        <TableCell>{formatEth(roundEth(weiToEth(row.numberOfTokens)))}</TableCell>
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
                        <TableCell>
                          {!row.claimed ? (
                            <Label
                              variant="secondary"
                              label="Not redeemed"
                              icon={<RedeemSidebar />}
                            />
                          ) : (
                            <Label
                              variant="success"
                              label="Redeemed"
                              icon={<Icons.GreenCircledCheck />}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {!row.claimed && (
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              label="Redeem"
                              className="smallBtn"
                              disabled={row.numberOfTokens.eq(0) || row.claimed || isOnWrongChain}
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
                  <EmptyTable
                    colspan={4}
                    message="Looks like you haven`t received any rewards yet..."
                  />
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
