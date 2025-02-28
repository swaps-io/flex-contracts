import { concatHex, Hex, AsHexValue, asHex } from '../external';

import { FLEX_RECEIVE_NONCES_PER_BUCKET } from '../constants';

export interface FlexEncodeReceiveStateBucketParams {
  receiver: AsHexValue;
  nonce: AsHexValue;
}

export function flexEncodeReceiveStateBucket(params: FlexEncodeReceiveStateBucketParams): Hex {
  const nonce = BigInt(asHex(params.nonce, 12));
  const nonceBucket = nonce / FLEX_RECEIVE_NONCES_PER_BUCKET;

  return concatHex([
    asHex(params.receiver, 20),
    asHex(nonceBucket, 12),
  ]);
}

export interface FlexEncodeReceiveStateOffsetParams {
  nonce: AsHexValue;
}

export function flexEncodeReceiveStateOffset(params: FlexEncodeReceiveStateOffsetParams): bigint {
  const nonce = BigInt(asHex(params.nonce, 12));
  const nonceOffset = nonce % FLEX_RECEIVE_NONCES_PER_BUCKET;
  return nonceOffset;
}

export interface FlexEncodeReceiveBucketStateDataParams {
  hash: AsHexValue;
  state: AsHexValue;
}

export function flexEncodeReceiveBucketStateData(params: FlexEncodeReceiveBucketStateDataParams): Hex {
  return concatHex([
    asHex(params.hash, 20),
    asHex(params.state, 12),
  ]);
}
