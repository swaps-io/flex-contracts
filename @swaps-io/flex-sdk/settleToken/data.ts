import { AsHexValue, Hex } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1, flexEncodeReceiveData2 } from '../receive';
import { flexEncodeSettleData0, flexEncodeSettleData1, flexEncodeSettleData2 } from '../settle';

export interface FlexEncodeSettleTokenDataParams {
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
  token: AsHexValue;
  amount: AsHexValue;
  deadline: AsHexValue;
  nonce: AsHexValue;
  keyHash: AsHexValue;
  confirm: boolean;
  settleReceiver: AsHexValue;
}

export interface FlexSettleTokenData {
  receiveData: [Hex, Hex, Hex],
  settleData: [Hex, Hex, Hex],
}

export function flexEncodeSettleTokenData(params: FlexEncodeSettleTokenDataParams): FlexSettleTokenData {
  const receiveData: FlexSettleTokenData['receiveData'] = [
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
    flexEncodeReceiveData2({
      token: params.token,
    }),
  ];

  const settleData: FlexSettleTokenData['settleData'] = [
    flexEncodeSettleData0({
      confirm: params.confirm,
      receiver: params.settleReceiver,
    }),
    flexEncodeSettleData1({
      keyHash: params.keyHash,
    }),
    flexEncodeSettleData2({
      receiveHash: flexCalcReceiveHash({ data: receiveData, }),
    }),
  ];

  const data: FlexSettleTokenData = {
    receiveData,
    settleData,
  };
  return data;
};
