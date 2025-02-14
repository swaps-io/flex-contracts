import { flexEncodeSettleTokenProofData, FlexEncodeSettleTokenProofDataParams, FlexSettleTokenProofData } from '../settleTokenProof';

export type FlexEncodeRefundTokenProofDataParams = Omit<FlexEncodeSettleTokenProofDataParams, 'confirm'>;

export type FlexRefundTokenProofData = FlexSettleTokenProofData;

export function flexEncodeRefundTokenProofData(params: FlexEncodeRefundTokenProofDataParams): FlexRefundTokenProofData {
  return flexEncodeSettleTokenProofData({ ...params, confirm: false });
};
