import { AsHexValue } from '../external';

import { flexEncodeSettleTokenProofData, FlexEncodeSettleTokenProofDataParams, FlexSettleTokenProofData } from '../settleTokenProof';

export interface FlexEncodeConfirmTokenProofDataParams extends Omit<FlexEncodeSettleTokenProofDataParams, 'confirm' | 'settleReceiver'> {
  confirmReceiver: AsHexValue;
}

export type FlexConfirmTokenProofData = FlexSettleTokenProofData;

export function flexEncodeConfirmTokenProofData(params: FlexEncodeConfirmTokenProofDataParams): FlexConfirmTokenProofData {
  return flexEncodeSettleTokenProofData({
    ...params,
    confirm: true,
    settleReceiver: params.confirmReceiver,
  });
};
