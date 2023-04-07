import axios from 'axios';

function request(name: string, params = [], id = 0) {
  return {
    jsonrpc: '2.0',
    id,
    method: name,
    params,
  };
}

export async function send(_request: any) {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_RPC}`, _request);
  return response.data.result || {};
}

export async function nodeStatus() {
  return send(request('get_node_status'));
}

export async function accountAddress() {
  return send(request('get_account_address'));
}

export async function netVersion() {
  return send(request('net_version'));
}

export async function netPeerCount() {
  return send(request('net_peerCount'));
}

export async function blockNumber() {
  return send(request('eth_blockNumber'));
}

export async function dagBlockLevel() {
  return send(request('taraxa_dagBlockLevel'));
}

export async function dagBlockPeriod() {
  return send(request('taraxa_dagBlockPeriod'));
}
