import {
  NetworkName,
  networks,
  getNetwork,
  getNetworkSubdomain,
} from './networks';
import type { Network, Networks } from './networks';
import { TaraxaDposClient } from './context/TaraxaDposClient';
import { TaraxaDposProvider, useTaraxaDpos } from './context/TaraxaDposContext';

export {
  networks,
  NetworkName,
  getNetwork,
  getNetworkSubdomain,
  TaraxaDposClient,
  TaraxaDposProvider,
  useTaraxaDpos,
};
export type { Network, Networks };
