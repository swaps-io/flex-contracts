import { asHex, AsHexValue, concatHex, Hex } from '../external';

import { FlexBranch } from '../branch';

import { flexAssignComponentDomain } from '../component';

import { FLEX_SEND_PROOF_BASE_HASH_SKIP, FLEX_SEND_PROOF_NATIVE_DATA3 } from '../constants';

export interface FlexEncodeSendProofParams {
  variant: AsHexValue;
  domain: AsHexValue;
  data: { sendData: [AsHexValue, AsHexValue, AsHexValue] | [AsHexValue, AsHexValue, AsHexValue, AsHexValue] };
  branch: Readonly<FlexBranch>;
  saveBucket: AsHexValue;
  saveTime: AsHexValue;
}

export function flexEncodeSendProof(params: FlexEncodeSendProofParams): Hex {
  let data = params.data.sendData;
  if (data.length === 3) {
    data = [...data, FLEX_SEND_PROOF_NATIVE_DATA3]; // Native sendData3
  }

  return concatHex([
    // ProofHeader
    asHex(params.variant, 32), // #0: variant
    // FlexSendProofData
    flexAssignComponentDomain({ domain: params.domain, data: data[0] }), // #1: sendData0
    ...data.slice(1).map((d) => asHex(d, 32)), // #2: sendData1, #3: sendData2, #4: sendData3
    asHex(288, 32), // #5: orderBranch offset (#9x32)
    FLEX_SEND_PROOF_BASE_HASH_SKIP, // #6: failBaseHash
    asHex(params.saveBucket, 32), // #7: saveBucket
    concatHex([asHex(0, 26), asHex(params.saveTime, 6)]),// #8: saveTime
    asHex(params.branch.length, 32), // #9: orderBranch length
    ...params.branch, // #10+: orderBranch
  ]);
}
