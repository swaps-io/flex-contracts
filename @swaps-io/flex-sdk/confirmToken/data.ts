import { flexEncodeSettleTokenData, FlexEncodeSettleTokenDataParams, FlexSettleTokenData } from '../settleToken';

export type FlexEncodeConfirmTokenDataParams = Omit<FlexEncodeSettleTokenDataParams, 'confirm'>;

export type FlexConfirmTokenData = FlexSettleTokenData;

export function flexEncodeConfirmTokenData(params: FlexEncodeConfirmTokenDataParams): FlexConfirmTokenData {
  return flexEncodeSettleTokenData({ ...params, confirm: true });
};
