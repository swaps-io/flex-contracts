import { Hex, AsHexValue } from '../external';

import { flexCalcReceiveFromHash } from '../receiveFrom';

import { FlexReceiveTokenFromData } from './data';

export interface FlexCalcReceiveTokenFromHashParams {
  domain: AsHexValue;
  data: Pick<FlexReceiveTokenFromData, 'receiveFromData'>;
}

export function flexCalcReceiveTokenFromHash(params: FlexCalcReceiveTokenFromHashParams): Hex {
  return flexCalcReceiveFromHash({ domain: params.domain, data: params.data.receiveFromData });
}
