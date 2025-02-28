import { concatHex, Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendBucketStateParams {
  hash: AsHexValue;
  time: AsHexValue;
}

export function flexEncodeSendBucketState(params: FlexEncodeSendBucketStateParams): Hex {
  return concatHex([
    asHex(params.hash, 20),
    asHex(0, 6),
    asHex(params.time, 6),
  ]);
}
