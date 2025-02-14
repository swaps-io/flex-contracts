import { AsHexValue } from '../external';

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
  receiveData: [AsHexValue, AsHexValue, AsHexValue],
  receiveFromData: [AsHexValue, AsHexValue],
}

export function flexEncodeReceiveTokenData(params: FlexEncodeReceiveTokenDataParams): FlexReceiveTokenData {
  const receiveData: [AsHexValue, AsHexValue, AsHexValue] = [
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

  const receiveFromData: [AsHexValue, AsHexValue] = [
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
