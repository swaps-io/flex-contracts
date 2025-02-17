import { AsHexValue } from '../external';

import { flexEncodeSettleTokenData, FlexEncodeSettleTokenDataParams, FlexSettleTokenData } from '../settleToken';

export interface FlexEncodeConfirmTokenDataParams extends Omit<FlexEncodeSettleTokenDataParams, 'confirm' | 'settleReceiver'> {
  confirmReceiver: AsHexValue;
}

export type FlexConfirmTokenData = FlexSettleTokenData;

export function flexEncodeConfirmTokenData(params: FlexEncodeConfirmTokenDataParams): FlexConfirmTokenData {
  return flexEncodeSettleTokenData({
    ...params,
    confirm: true,
    settleReceiver: params.confirmReceiver,
  });
};
