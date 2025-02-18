import { AsHexValue } from '../external';

import { flexEncodeSettleTokenProofData, FlexEncodeSettleTokenProofDataParams, FlexSettleTokenProofData } from '../settleTokenProof';

export interface FlexEncodeRefundTokenProofDataParams extends Omit<FlexEncodeSettleTokenProofDataParams, 'confirm' | 'settleReceiver'> {
  refundReceiver: AsHexValue;
}

export type FlexRefundTokenProofData = FlexSettleTokenProofData;

export function flexEncodeRefundTokenProofData(params: FlexEncodeRefundTokenProofDataParams): FlexRefundTokenProofData {
  return flexEncodeSettleTokenProofData({
    ...params,
    confirm: false,
    settleReceiver: params.refundReceiver,
  });
};
