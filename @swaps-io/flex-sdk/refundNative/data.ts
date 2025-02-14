import { flexEncodeSettleNativeData, FlexEncodeSettleNativeDataParams, FlexSettleNativeData } from '../settleNative';

export type FlexEncodeRefundNativeDataParams = Omit<FlexEncodeSettleNativeDataParams, 'confirm'>;

export type FlexRefundNativeData = FlexSettleNativeData;

export function flexEncodeRefundNativeData(params: FlexEncodeRefundNativeDataParams): FlexRefundNativeData {
  return flexEncodeSettleNativeData({ ...params, confirm: false });
};
