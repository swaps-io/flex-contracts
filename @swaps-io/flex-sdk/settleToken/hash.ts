import { Hex, AsHexValue } from '../external';

import { flexCalcSettleHash } from '../settle';

import { FlexSettleTokenData } from './data';

export interface FlexCalcSettleTokenHashParams {
  domain: AsHexValue;
  data: Pick<FlexSettleTokenData, 'settleData'>,
}

export function flexCalcSettleTokenHash(params: FlexCalcSettleTokenHashParams): Hex {
  return flexCalcSettleHash({ domain: params.domain, data: params.data.settleData });
}
