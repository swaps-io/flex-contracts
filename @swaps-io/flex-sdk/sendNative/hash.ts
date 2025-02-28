import { Hex, AsHexValue } from '../external';

import { flexCalcSendHash } from '../send';

import { FlexSendNativeData } from './data';

export interface FlexCalcSendNativeHashParams {
  domain: AsHexValue;
  data: Pick<FlexSendNativeData, 'sendData'>;
}

export function flexCalcSendNativeHash(params: FlexCalcSendNativeHashParams): Hex {
  return flexCalcSendHash({ domain: params.domain, data: params.data.sendData });
}
