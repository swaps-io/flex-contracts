import { Hex, AsHexValue } from '../external';

import { flexCalcSettleProofHash } from '../settleProof';

import { FlexSettleTokenProofData } from './data';

export interface FlexCalcSettleTokenProofHashParams {
  domain: AsHexValue;
  data: Pick<FlexSettleTokenProofData, 'settleProofData'>;
}

export function flexCalcSettleTokenProofHash(params: FlexCalcSettleTokenProofHashParams): Hex {
  return flexCalcSettleProofHash({ domain: params.domain, data: params.data.settleProofData });
}
