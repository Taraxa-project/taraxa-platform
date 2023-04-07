import { nodeStatus } from '../../lib/rpc';

export default async function statusHandler(_: any, res: any) {
  try {
    const status = await nodeStatus();
    return res.json(status);
  } catch (e: any) {
    res.status(e.status).json({ error: e.message });
  }
  return null;
}
