import { AsHexValue, Hex } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1 } from '../receive';
import { flexEncodeSettleData0, flexEncodeSettleData1, flexEncodeSettleData2 } from '../settle';

export interface FlexEncodeSettleNativeDataParams {
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
  amount: AsHexValue;
  deadline: AsHexValue;
  nonce: AsHexValue;
  keyHash: AsHexValue;
  confirm: boolean;
}

export interface FlexSettleNativeData {
  receiveData: [Hex, Hex],
  settleData: [Hex, Hex, Hex],
}

export function flexEncodeSettleNativeData(params: FlexEncodeSettleNativeDataParams): FlexSettleNativeData {
  const receiveData: FlexSettleNativeData['receiveData'] = [
    flexEncodeReceiveData0({
      contractSignature: params.receiverContract,
      noRetryAsContractSignature: params.receiverNoRetryAsContract,
      deadline: params.deadline,
      receiver: params.receiver,
      nonce: params.nonce,
    }),
    flexEncodeReceiveData1({
      amount: params.amount,
    }),
  ];

  const settleData: FlexSettleNativeData['settleData'] = [
    flexEncodeSettleData0({
      confirm: params.confirm,
      receiver: params.receiver,
    }),
    flexEncodeSettleData1({
      keyHash: params.keyHash,
    }),
    flexEncodeSettleData2({
      receiveHash: flexCalcReceiveHash({ data: receiveData, }),
    }),
  ];

  const data: FlexSettleNativeData = {
    receiveData,
    settleData,
  };
  return data;
};
