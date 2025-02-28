import { concatHex, Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendStateBucketParams {
  sender: AsHexValue;
  group: AsHexValue;
}

export function flexEncodeSendStateBucket(params: FlexEncodeSendStateBucketParams): Hex {
  return concatHex([
    asHex(params.sender, 20),
    asHex(params.group, 12),
  ]);
}

export interface FlexEncodeSendBucketStateDataParams {
  hash: AsHexValue;
  time: AsHexValue;
}

export function flexEncodeSendBucketStateData(params: FlexEncodeSendBucketStateDataParams): Hex {
  return concatHex([
    asHex(params.hash, 20),
    asHex(0, 6),
    asHex(params.time, 6),
  ]);
}
