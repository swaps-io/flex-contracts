import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexAllocateReceiveData0Params {
  receiver: AsHexValue;
  startNonce: AsHexValue;
  totalBuckets: AsHexValue;
}

export function encodeFlexAllocateReceiveData0(params: EncodeFlexAllocateReceiveData0Params): Hex {
  return concatHex([
    asHex(params.totalBuckets, 6),
    asHex(params.startNonce, 6),
    asHex(params.receiver, 20),
  ]);
}
