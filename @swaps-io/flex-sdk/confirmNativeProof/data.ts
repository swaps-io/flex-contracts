import { flexEncodeSettleNativeProofData, FlexEncodeSettleNativeProofDataParams, FlexSettleNativeProofData } from '../settleNativeProof';

export type FlexEncodeConfirmNativeProofDataParams = Omit<FlexEncodeSettleNativeProofDataParams, 'confirm'>;

export type FlexConfirmNativeProofData = FlexSettleNativeProofData;

export function flexEncodeConfirmNativeProofData(params: FlexEncodeConfirmNativeProofDataParams): FlexConfirmNativeProofData {
  return flexEncodeSettleNativeProofData({ ...params, confirm: true });
};
