import { AsHexValue, Hex } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1, flexEncodeReceiveData2 } from '../receive';
import { flexEncodeReceiveFromData0, flexEncodeReceiveFromData1 } from '../receiveFrom';

export interface FlexEncodeReceiveTokenFromDataParams {
  sender: AsHexValue;
  senderContract: boolean;
  senderNoMessageWrap?: boolean;
  senderNoRetryAsContract?: boolean;
  receiver: AsHexValue;
  token: AsHexValue;
  amount: AsHexValue;
  deadline: AsHexValue;
  nonce: AsHexValue;
}

export interface FlexReceiveTokenFromData {
  receiveData: [Hex, Hex, Hex];
  receiveFromData: [Hex, Hex];
  receivePackData: [Hex];
}

export function flexEncodeReceiveTokenFromData(params: FlexEncodeReceiveTokenFromDataParams): FlexReceiveTokenFromData {
  const receiveData: FlexReceiveTokenFromData['receiveData'] = [
    flexEncodeReceiveData0({
      contractSignature: params.senderContract,
      noMessageSignatureWrap: params.senderNoMessageWrap,
      noRetryAsContractSignature: params.senderNoRetryAsContract,
      deadline: params.deadline,
      receiver: params.receiver,
      nonce: params.nonce,
    }),
    flexEncodeReceiveData1({
      amount: params.amount,
    }),
    flexEncodeReceiveData2({
      token: params.token,
    }),
  ];

  const receiveFromData: FlexReceiveTokenFromData['receiveFromData'] = [
    flexEncodeReceiveFromData0({
      sender: params.sender,
    }),
    flexEncodeReceiveFromData1({
      receiveHash: flexCalcReceiveHash({ data: receiveData, }),
    }),
  ];

  const receivePackData: FlexReceiveTokenFromData['receivePackData'] = [
    flexEncodeReceiveData0({
      contractSignature: params.senderContract,
      noMessageSignatureWrap: params.senderNoMessageWrap,
      noRetryAsContractSignature: params.senderNoRetryAsContract,
      deadline: params.deadline,
      receiver: params.sender, // Replaced with receiver during unpack
      nonce: params.nonce,
    }),
  ];

  const data: FlexReceiveTokenFromData = {
    receiveData,
    receiveFromData,
    receivePackData,
  };
  return data;
};
