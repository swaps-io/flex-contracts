import { flexEncodeSettleNativeData, FlexEncodeSettleNativeDataParams, FlexSettleNativeData } from '../settleNative';

export type FlexEncodeConfirmNativeDataParams = Omit<FlexEncodeSettleNativeDataParams, 'confirm'>;

export type FlexConfirmNativeData = FlexSettleNativeData;

export function flexEncodeConfirmNativeData(params: FlexEncodeConfirmNativeDataParams): FlexConfirmNativeData {
  return flexEncodeSettleNativeData({ ...params, confirm: true });
};
