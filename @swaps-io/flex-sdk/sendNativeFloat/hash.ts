import { Hex, AsHexValue } from '../external';

import { flexCalcSendHash } from '../send';

import { FlexSendNativeFloatData } from './data';

export interface FlexCalcSendNativeFloatHashParams {
  domain: AsHexValue;
  data: Pick<FlexSendNativeFloatData, 'sendData'>,
}

export function flexCalcSendNativeFloatHash(params: FlexCalcSendNativeFloatHashParams): Hex {
  return flexCalcSendHash({ domain: params.domain, data: params.data.sendData });
}
