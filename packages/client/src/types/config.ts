export interface ShadowProtocolConfig {
  rpcUrl: string;
  programId: string;
  clusterOffset: number;
  callbackUrl?: string;
}

export interface MXEConfig {
  publicKey: Uint8Array;
  clusterOffset: number;
}