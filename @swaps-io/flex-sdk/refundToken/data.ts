import { AsHexValue } from '../external';

import { flexEncodeSettleTokenData, FlexEncodeSettleTokenDataParams, FlexSettleTokenData } from '../settleToken';

export interface FlexEncodeRefundTokenDataParams extends Omit<FlexEncodeSettleTokenDataParams, 'confirm' | 'settleReceiver'> {
  refundReceiver: AsHexValue;
}

export type FlexRefundTokenData = FlexSettleTokenData;

export function flexEncodeRefundTokenData(params: FlexEncodeRefundTokenDataParams): FlexRefundTokenData {
  return flexEncodeSettleTokenData({
    ...params,
    confirm: false,
    settleReceiver: params.refundReceiver,
  });
};
