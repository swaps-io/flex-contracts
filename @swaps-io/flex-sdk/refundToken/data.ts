import { flexEncodeSettleTokenData, FlexEncodeSettleTokenDataParams, FlexSettleTokenData } from '../settleToken';

export type FlexEncodeRefundTokenDataParams = Omit<FlexEncodeSettleTokenDataParams, 'confirm'>;

export type FlexRefundTokenData = FlexSettleTokenData;

export function flexEncodeRefundTokenData(params: FlexEncodeRefundTokenDataParams): FlexRefundTokenData {
  return flexEncodeSettleTokenData({ ...params, confirm: false });
};
