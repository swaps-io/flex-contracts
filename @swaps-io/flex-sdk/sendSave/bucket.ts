import { asHex, AsHexValue, concatHex, Hex } from '../external';

export interface FlexEncodeSendSaveBucketParams {
  saver: AsHexValue;
  slot: AsHexValue;
}

export function flexEncodeSendSaveBucket(params: FlexEncodeSendSaveBucketParams): Hex {
  return concatHex([
    asHex(params.saver, 20),
    asHex(params.slot, 12),
  ]);
}
