import { asHex, AsHexValue, concatHex, Hex } from '../external';

export interface FlexEncodeSaveSendDataParams {
  slot: AsHexValue;
  group: AsHexValue;
  sender: AsHexValue;
}

export function flexEncodeSaveSendData(params: FlexEncodeSaveSendDataParams): Hex {
  return concatHex([
    asHex(params.slot, 6),
    asHex(params.group, 6),
    asHex(params.sender, 20),
  ]);
}
