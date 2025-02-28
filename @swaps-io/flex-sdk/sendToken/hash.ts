import { Hex, AsHexValue } from '../external';

import { flexCalcSendHash } from '../send';

import { FlexSendTokenData } from './data';

export interface FlexCalcSendTokenHashParams {
  domain: AsHexValue;
  data: Pick<FlexSendTokenData, 'sendData'>;
}

export function flexCalcSendTokenHash(params: FlexCalcSendTokenHashParams): Hex {
  return flexCalcSendHash({ domain: params.domain, data: params.data.sendData });
}
