import { asHex, AsHexValue, concatHex, Hex, sliceHex } from '../external';

export interface FlexAssignComponentDomainParams {
  domain: AsHexValue;
  data: AsHexValue;
}

export function flexAssignComponentDomain(params: FlexAssignComponentDomainParams): Hex {
  return concatHex([
    asHex(params.domain, 8),
    sliceHex(asHex(params.data, 32), 8),
  ]);
}
