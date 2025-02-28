import { Hex, AsHexValue } from '../external';

import { flexCalcSettleProofHash } from '../settleProof';

import { FlexSettleNativeProofData } from './data';

export interface FlexCalcSettleNativeProofHashParams {
  domain: AsHexValue;
  data: Pick<FlexSettleNativeProofData, 'settleProofData'>;
}

export function flexCalcSettleNativeProofHash(params: FlexCalcSettleNativeProofHashParams): Hex {
  return flexCalcSettleProofHash({ domain: params.domain, data: params.data.settleProofData });
}
