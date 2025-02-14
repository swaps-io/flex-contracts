import { AsHexValue, Hex } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1 } from '../receive';
import { flexEncodeReceiveFromData0, flexEncodeReceiveFromData1 } from '../receiveFrom';

export interface FlexEncodeReceiveNativeDataParams {
  sender: AsHexValue;
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
  amount: AsHexValue;
  deadline: AsHexValue;
}

export interface FlexReceiveNativeData {
  receiveData: [Hex, Hex],
  receiveFromData: [Hex, Hex],
}

export function flexEncodeReceiveNativeData(params: FlexEncodeReceiveNativeDataParams): FlexReceiveNativeData {
  const receiveData: FlexReceiveNativeData['receiveData'] = [
    flexEncodeReceiveData0({
      contractSignature: params.receiverContract,
      noRetryAsContractSignature: params.receiverNoRetryAsContract,
      deadline: params.deadline,
      receiver: params.receiver,
    }),
    flexEncodeReceiveData1({
      amount: params.amount,
    }),
  ];

  const receiveFromData: FlexReceiveNativeData['receiveFromData'] = [
    flexEncodeReceiveFromData0({
      sender: params.sender,
    }),
    flexEncodeReceiveFromData1({
      receiveHash: flexCalcReceiveHash({ data: receiveData, }),
    }),
  ];

  const data: FlexReceiveNativeData = {
    receiveData,
    receiveFromData,
  };
  return data;
};
