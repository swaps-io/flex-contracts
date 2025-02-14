import { asHex, AsHexValue, concatHex, Hex } from '../external';

import { flexPackFlags } from '../flags';

export interface FlexEncodeSettleData0Params {
  confirm: boolean;
  receiver: AsHexValue;
}

export function flexEncodeSettleData0(params: FlexEncodeSettleData0Params): Hex {
  return concatHex([
    asHex(0, 8),
    asHex(flexPackFlags([params.confirm], 31), 4),
    asHex(params.receiver, 20),
  ]);
}
