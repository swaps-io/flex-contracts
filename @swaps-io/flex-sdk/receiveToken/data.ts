import { AsHexValue, Hex } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1, flexEncodeReceiveData2 } from '../receive';
import { flexEncodeReceiveFromData0, flexEncodeReceiveFromData1 } from '../receiveFrom';

export interface FlexEncodeReceiveTokenDataParams {
  sender: AsHexValue;
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
  token: AsHexValue;
  amount: AsHexValue;
  deadline: AsHexValue;
}

export interface FlexReceiveTokenData {
  receiveData: [Hex, Hex, Hex],
  receiveFromData: [Hex, Hex],
}

export function flexEncodeReceiveTokenData(params: FlexEncodeReceiveTokenDataParams): FlexReceiveTokenData {
  const receiveData: FlexReceiveTokenData['receiveData'] = [
    flexEncodeReceiveData0({
      contractSignature: params.receiverContract,
      noRetryAsContractSignature: params.receiverNoRetryAsContract,
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

  const receiveFromData: FlexReceiveTokenData['receiveFromData'] = [
    flexEncodeReceiveFromData0({
      sender: params.sender,
    }),
    flexEncodeReceiveFromData1({
      receiveHash: flexCalcReceiveHash({ data: receiveData, }),
    }),
  ];

  const data: FlexReceiveTokenData = {
    receiveData,
    receiveFromData,
  };
  return data;
};
