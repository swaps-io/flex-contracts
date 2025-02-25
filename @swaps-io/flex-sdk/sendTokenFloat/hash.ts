import { Hex, AsHexValue } from '../external';

import { flexCalcSendHash } from '../send';

import { FlexSendTokenFloatData } from './data';

export interface FlexCalcSendTokenFloatHashParams {
  domain: AsHexValue;
  data: Pick<FlexSendTokenFloatData, 'sendData'>,
}

export function flexCalcSendTokenFloatHash(params: FlexCalcSendTokenFloatHashParams): Hex {
  return flexCalcSendHash({ domain: params.domain, data: params.data.sendData });
}
