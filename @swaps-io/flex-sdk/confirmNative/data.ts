import { AsHexValue } from '../external';

import { flexEncodeSettleNativeData, FlexEncodeSettleNativeDataParams, FlexSettleNativeData } from '../settleNative';

export interface FlexEncodeConfirmNativeDataParams extends Omit<FlexEncodeSettleNativeDataParams, 'confirm' | 'settleReceiver'> {
  confirmReceiver: AsHexValue;
}

export type FlexConfirmNativeData = FlexSettleNativeData;

export function flexEncodeConfirmNativeData(params: FlexEncodeConfirmNativeDataParams): FlexConfirmNativeData {
  return flexEncodeSettleNativeData({
    ...params,
    confirm: true,
    settleReceiver: params.confirmReceiver,
  });
};
