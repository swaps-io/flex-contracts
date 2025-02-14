import { AsHexValue } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1, flexEncodeReceiveData2 } from '../receive';
import { flexEncodeReceiveFromData0, flexEncodeReceiveFromData1 } from '../receiveFrom';

export interface FlexEncodeReceiveTokenFromDataParams {
  sender: AsHexValue;
  senderContract: boolean;
  senderNoRetryAsContract?: boolean;
  receiver: AsHexValue;
  token: AsHexValue;
  amount: AsHexValue;
  deadline: AsHexValue;
}

export interface FlexReceiveTokenFromData {
  receiveData: [AsHexValue, AsHexValue, AsHexValue],
  receiveFromData: [AsHexValue, AsHexValue],
}

export function flexEncodeReceiveTokenFromData(params: FlexEncodeReceiveTokenFromDataParams): FlexReceiveTokenFromData {
  const receiveData: FlexReceiveTokenFromData['receiveData'] = [
    flexEncodeReceiveData0({
      contractSignature: params.senderContract,
      noRetryAsContractSignature: params.senderNoRetryAsContract,
      deadline: params.deadline,
      receiver: params.receiver,
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

  const data: FlexReceiveTokenFromData = {
    receiveData,
    receiveFromData,
  };
  return data;
};
