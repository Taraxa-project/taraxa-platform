/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import axios from 'axios';
import { Header, Footer, Text, BaseCard, Button } from '@taraxa_project/taraxa-ui';

export default function Home() {
  const [nodeAddress, setNodeAddress] = useState('');
  const [copy, setCopy] = useState('Copy');
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dposNodeVotes, setDposNodeVotes] = useState(0);
  const [peerPbftBlockCount, setPeerPbftBlockCount] = useState(0);
  const [pbftBlocks, setPbftBlocks] = useState(0);
  const [dagBlocks, setDagBlocks] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [peers, setPeers] = useState(0);
  const [blocksHistory, setBlocksHistory] = useState([]);

  useEffect(() => {
    axios.get(`/api/address`).then((response) => {
      setNodeAddress(response.data.value || '');
    });
  }, []);

  useEffect(() => {
    const updateStatus = () => {
      axios.get(`/api/status`).then((response) => {
        if (!response.data) {
          return;
        }
        const status = response.data;
        setIsSynced(status.synced);
        setDposNodeVotes(status.dpos_node_votes);
        setPbftBlocks(status.pbft_size);
        setDagBlocks(status.blk_executed);
        setTransactions(status.trx_executed);
        setPeers(status.peer_count);

        setBlocksHistory((bh) => {
          const n = [...bh];
          n.unshift(status.pbft_size);
          return n.slice(0, 5);
        });

        setPeerPbftBlockCount(
          Math.max(
            ...status.network.peers.filter((peer) => peer.dag_synced).map((peer) => peer.pbft_size),
          ),
        );
      });
    };

    updateStatus();

    const checkInterval = setInterval(() => {
      updateStatus();
    }, 3000);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  useEffect(() => {
    const uniqueBlocks = [...new Set(blocksHistory)];
    if (uniqueBlocks.length > 1) {
      setIsSyncing(true);
    } else {
      setIsSyncing(false);
    }
  }, [blocksHistory]);

  let syncedPercent = Math.round((pbftBlocks / peerPbftBlockCount) * 100);
  if (Number.isNaN(syncedPercent)) {
    syncedPercent = 0;
  }
  if (syncedPercent < 0) {
    syncedPercent = 0;
  }
  if (syncedPercent > 100) {
    syncedPercent = 100;
  }

  const inputRef = useRef(null);

  const copyText = (event) => {
    event.preventDefault();

    // eslint-disable-next-line no-shadow
    const copyText = inputRef.current;

    copyText.select();
    copyText.setSelectionRange(0, 99999);
    // eslint-disable-next-line no-undef
    document.execCommand('copy');

    setCopy('Copied');

    setTimeout(() => {
      setCopy('Copy');
    }, 3000);
  };

  let status = '';

  if (isSynced) {
    status = 'Synced';
    if (dposNodeVotes > 0) {
      status += ' - Participating in consensus';
    }
  } else {
    status = 'Not synced';

    if (isSyncing) {
      status += ' - is syncing';
    } else {
      status += ' - not syncing';
    }
  }

  return (
    <>
      <Head>
        <title>Taraxa Node Status :: {status}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header title="Taraxa Node Status" color="primary" position="relative" elevation={0} />

      <main className="App">
        <Text label="Taraxa Node Status" variant="h1" color="primary" className="title" />
        <Text
          label="Track the current status and performance of your Taraxa testnet node."
          variant="body2"
          color="textSecondary"
          className="subtitle"
        />

        <Text label={`${status}:`} variant="h2" color="primary" className="status" />

        <div className="progress-bar">
          <div className="progress-bar-inner" style={{ width: `${syncedPercent}%` }} />
          <Text
            label={`${syncedPercent}%`}
            variant="body2"
            color="textSecondary"
            className="percentage"
          />
        </div>

        <div className="grid">
          <BaseCard
            title={ethers.utils.commify(pbftBlocks.toString())}
            description="Number of PBFT Blocks"
          />
          <BaseCard
            title={ethers.utils.commify(dagBlocks.toString())}
            description="Number of DAG Blocks"
          />
        </div>
        <div className="grid">
          <BaseCard
            title={ethers.utils.commify(transactions.toString())}
            description="Number of transactions"
          />
          <BaseCard title={ethers.utils.commify(peers.toString())} description="Number of Peers" />
        </div>

        {nodeAddress !== '' && (
          <>
            <Text label="Your node address:" variant="h2" color="primary" className="status" />
            <Text
              label="In order to get rewards you need to register your node address on Community Site."
              variant="body2"
              color="textSecondary"
              className="subtitle"
            />
            <div className="address-container">
              <div className="address-box">
                <input
                  id="address"
                  ref={inputRef}
                  onClick={(event) => event.target.select()}
                  type="text"
                  value={`0x${nodeAddress}`}
                  readOnly
                />
                <a href="#" onClick={copyText}>
                  {copy}
                </a>
              </div>
              <div className="address">
                <Button
                  label="Register your node in our Community Site"
                  color="secondary"
                  variant="contained"
                  onClick={() =>
                    // eslint-disable-next-line no-undef
                    window.open('https://community.taraxa.io/node', '_blank', 'noreferrer noopener')
                  }
                />
              </div>
            </div>
          </>
        )}

        <Footer
          description="Taraxa is a public ledger platform purpose-built for audit logging of informal transactions."
          links={[{ label: 'Privacy Policy', link: 'https://taraxa.io/privacy' }]}
          items={[
            {
              label: 'Send',
              Icon: <a href="https://www.taraxa.io/tg" target="_blank" rel="noreferrer" />,
            },
            {
              label: 'Discord',
              Icon: <a href="https://www.taraxa.io/discord" target="_blank" rel="noreferrer" />,
            },
            {
              label: 'Twitter',
              Icon: <a href="https://www.taraxa.io/twitter" target="_blank" rel="noreferrer" />,
            },
          ]}
        />
      </main>
    </>
  );
}
