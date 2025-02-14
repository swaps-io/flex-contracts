import { flexEncodeSettleNativeProofData, FlexEncodeSettleNativeProofDataParams, FlexSettleNativeProofData } from '../settleNativeProof';

export type FlexEncodeRefundNativeProofDataParams = Omit<FlexEncodeSettleNativeProofDataParams, 'confirm'>;

export type FlexRefundNativeProofData = FlexSettleNativeProofData;

export function flexEncodeRefundNativeProofData(params: FlexEncodeRefundNativeProofDataParams): FlexRefundNativeProofData {
  return flexEncodeSettleNativeProofData({ ...params, confirm: false });
};
