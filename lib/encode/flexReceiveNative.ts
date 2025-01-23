import { bih } from '../core/bih';
import { Hex } from '../core/hex';

export interface EncodeFlexReceiveNativeParamBundleParams {
  deadline: bigint,
  nonce: bigint,
  group: bigint,
  receiver: Hex,
};

export const FLEX_RECEIVE_NATIVE_MIN_DEADLINE = 0n;
export const FLEX_RECEIVE_NATIVE_MAX_DEADLINE = 2n ** 48n - 1n;

export const FLEX_RECEIVE_NATIVE_MIN_NONCE = 0n;
export const FLEX_RECEIVE_NATIVE_MAX_NONCE = 2n ** 32n - 1n;

export const FLEX_RECEIVE_NATIVE_MIN_GROUP = 0n;
export const FLEX_RECEIVE_NATIVE_MAX_GROUP = 2n ** 16n - 1n;

export const FLEX_RECEIVE_NATIVE_RECEIVER_BYTE_SIZE = 20n;
export const FLEX_RECEIVE_NATIVE_RECEIVER_BIT_SIZE = FLEX_RECEIVE_NATIVE_RECEIVER_BYTE_SIZE * 8n;

const FLEX_RECEIVE_NATIVE_MIN_RECEIVER = 0n;
const FLEX_RECEIVE_NATIVE_MAX_RECEIVER = 2n ** FLEX_RECEIVE_NATIVE_RECEIVER_BIT_SIZE - 1n;

export function encodeFlexReceiveNativeParamBundle(params: EncodeFlexReceiveNativeParamBundleParams): Hex {
  // TODO: add checks
  // if (params.deadline < FLEX_RECEIVE_NATIVE_MIN_DEADLINE || params.deadline > FLEX_RECEIVE_NATIVE_MAX_DEADLINE) {
  //   throw new FlexError(`Receive native deadline ${params.deadline} is out of ${FLEX_RECEIVE_NATIVE_MIN_DEADLINE}-${FLEX_RECEIVE_NATIVE_MAX_DEADLINE} range`);
  // }

  return encodeFlexReceiveNativeParamBundleUnchecked(params);
};

export function encodeFlexReceiveNativeParamBundleUnchecked(params: EncodeFlexReceiveNativeParamBundleParams): Hex {
  return bih(
    params.deadline << 208n |
    params.nonce << 176n |
    params.group << 160n |
    BigInt(params.receiver)
  );
};
