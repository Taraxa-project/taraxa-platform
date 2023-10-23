import { ethers } from 'ethers';

export interface ProviderFactory {
  createProvider(): ethers.providers.Provider;
  createSigner(provider: ethers.providers.Provider): ethers.Signer | null;
}

export class JsonRpcProviderFactory implements ProviderFactory {
  private rpcUrl: string;

  private privateKey?: string;

  constructor(rpcUrl: string, privateKey?: string) {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
  }

  createProvider(): ethers.providers.Provider {
    return new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  createSigner(provider: ethers.providers.Provider): ethers.Signer | null {
    if (this.privateKey) {
      return new ethers.Wallet(this.privateKey, provider);
    }
    return null;
  }
}

export class Web3ProviderFactory implements ProviderFactory {
  createProvider(): ethers.providers.Provider {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum, 'any');
    }
    throw new Error('Web3 environment not detected');
  }

  createSigner(provider: ethers.providers.Provider): ethers.Signer {
    return (provider as ethers.providers.Web3Provider).getSigner();
  }
}
