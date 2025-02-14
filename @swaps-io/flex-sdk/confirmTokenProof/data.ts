import { flexEncodeSettleTokenProofData, FlexEncodeSettleTokenProofDataParams, FlexSettleTokenProofData } from '../settleTokenProof';

export type FlexEncodeConfirmTokenProofDataParams = Omit<FlexEncodeSettleTokenProofDataParams, 'confirm'>;

export type FlexConfirmTokenProofData = FlexSettleTokenProofData;

export function flexEncodeConfirmTokenProofData(params: FlexEncodeConfirmTokenProofDataParams): FlexConfirmTokenProofData {
  return flexEncodeSettleTokenProofData({ ...params, confirm: true });
};
