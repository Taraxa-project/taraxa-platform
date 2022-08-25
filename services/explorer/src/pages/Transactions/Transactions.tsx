import React from 'react';
import { Label, Table, Icons } from '@taraxa_project/taraxa-ui';

const cols = [
  { path: 'timestamp', name: 'Timestamp' },
  { path: 'block', name: 'Block' },
  { path: 'status', name: 'Status' },
  { path: 'txHash', name: 'TxHash' },
  { path: 'value', name: 'Value' },
];

const rows = [
  {
    data: [
      {
        timestamp: '15/02/2022',
        block: '529133',
        status: (
          <Label
            variant='success'
            label='Success'
            icon={<Icons.GreenCircledCheck />}
          />
        ),
        txHash: (
          <p
            style={{
              color: '#15AC5B',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            '0x00e193a15486909eba3fb36c815cb8a331180cc97a27ffb69b8122de02e5ea18'
          </p>
        ),
        value: '0.000000 TARA',
      },
    ],
  },
  {
    data: [
      {
        timestamp: '15/02/2022',
        block: '529132',
        status: (
          <Label
            variant='success'
            label='Success'
            icon={<Icons.GreenCircledCheck />}
          />
        ),
        txHash: (
          <p
            style={{
              color: '#15AC5B',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            '0x00e193a15486909eba3fb36c81scb8a331180cc97a27ffb69b8122de02e5ea18'
          </p>
        ),
        value: '0.00001 TARA',
      },
    ],
  },
  {
    data: [
      {
        timestamp: '15/02/2022',
        block: '529131',
        status: (
          <Label
            variant='error'
            label='Failure'
            icon={<Icons.RedCircledCancel />}
          />
        ),
        txHash: (
          <p
            style={{
              color: '#15AC5B',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            '0x00e193a15486909eba3fb36c81scb8a331180cc97a27ffb69b8122de02e5ea18'
          </p>
        ),
        value: '0.01 TARA',
      },
    ],
  },
  {
    data: [
      {
        timestamp: '15/02/2022',
        block: '529131',
        status: (
          <Label
            variant='error'
            label='Failure'
            icon={<Icons.RedCircledCancel />}
          />
        ),
        txHash: (
          <p style={{ color: '#15AC5B' }}>
            '0x00e193a15486909eba3fb36c81scb8a331180cc97a27ffb69b8122de02e5ea18'
          </p>
        ),
        value: '1 TARA',
      },
    ],
  },
  {
    data: [
      {
        timestamp: '15/02/2022',
        block: '529132',
        status: (
          <Label
            variant='error'
            label='Failure'
            icon={<Icons.RedCircledCancel />}
          />
        ),
        txHash: (
          <p
            style={{
              color: '#15AC5B',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            '0x00e193a15486909eba3fb36c81scb8a331180cc97a27ffb69b8122de02e5ea18'
          </p>
        ),
        value: '0.00001 TARA',
      },
    ],
  },
  {
    data: [
      {
        timestamp: '15/02/2022',
        block: '529132',
        status: (
          <Label
            variant='error'
            label='Failure'
            icon={<Icons.RedCircledCancel />}
          />
        ),
        txHash: (
          <p style={{ color: '#15AC5B' }}>
            '0x00e193a15486909eba3fb36c81scb8a331180cc97a27ffb69b8122de02e5ea18'
          </p>
        ),
        value: '0.00001 TARA',
      },
    ],
  },
];

const TransactionsPage = () => {
  return (
    <div>
      <Table rows={rows} columns={cols} />
    </div>
  );
};

export default TransactionsPage;
