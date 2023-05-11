import { accountAddress } from '../../lib/rpc';

export default async function addressHandler(_: any, res: any) {
  try {
    const address = await accountAddress();
    return res.json(address);
  } catch (e: any) {
    res.status(e.status).json({ error: e.message });
  }
  return null;
}
