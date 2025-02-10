import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeAllocateReceiveData0Params {
  receiver: AsHexValue;
  startNonce: AsHexValue;
  totalBuckets: AsHexValue;
}

export function flexEncodeAllocateReceiveData0(params: FlexEncodeAllocateReceiveData0Params): Hex {
  return concatHex([
    asHex(params.totalBuckets, 6),
    asHex(params.startNonce, 6),
    asHex(params.receiver, 20),
  ]);
}
