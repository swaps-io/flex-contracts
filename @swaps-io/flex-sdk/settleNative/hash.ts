import { Hex, AsHexValue } from '../external';

import { flexCalcSettleHash } from '../settle';

import { FlexSettleNativeData } from './data';

export interface FlexCalcSettleNativeHashParams {
  domain: AsHexValue;
  data: Pick<FlexSettleNativeData, 'settleData'>,
}

export function flexCalcSettleNativeHash(params: FlexCalcSettleNativeHashParams): Hex {
  return flexCalcSettleHash({ domain: params.domain, data: params.data.settleData });
}
