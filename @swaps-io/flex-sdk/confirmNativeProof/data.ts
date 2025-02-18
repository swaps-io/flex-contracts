import { AsHexValue } from '../external';

import { flexEncodeSettleNativeProofData, FlexEncodeSettleNativeProofDataParams, FlexSettleNativeProofData } from '../settleNativeProof';

export interface FlexEncodeConfirmNativeProofDataParams extends Omit<FlexEncodeSettleNativeProofDataParams, 'confirm' | 'settleReceiver'> {
  confirmReceiver: AsHexValue;
}

export type FlexConfirmNativeProofData = FlexSettleNativeProofData;

export function flexEncodeConfirmNativeProofData(params: FlexEncodeConfirmNativeProofDataParams): FlexConfirmNativeProofData {
  return flexEncodeSettleNativeProofData({
    ...params,
    confirm: true,
    settleReceiver: params.confirmReceiver,
  });
};
