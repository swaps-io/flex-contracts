import { AsHexValue } from '../external';

import { flexEncodeSettleNativeProofData, FlexEncodeSettleNativeProofDataParams, FlexSettleNativeProofData } from '../settleNativeProof';

export interface FlexEncodeRefundNativeProofDataParams extends Omit<FlexEncodeSettleNativeProofDataParams, 'confirm' | 'settleReceiver'> {
  refundReceiver: AsHexValue;
}

export type FlexRefundNativeProofData = FlexSettleNativeProofData;

export function flexEncodeRefundNativeProofData(params: FlexEncodeRefundNativeProofDataParams): FlexRefundNativeProofData {
  return flexEncodeSettleNativeProofData({
    ...params,
    confirm: false,
    settleReceiver: params.refundReceiver,
  });
};
