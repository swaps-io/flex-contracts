import { AsHexValue } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1 } from '../receive';
import { flexEncodeSettleProofData0, flexEncodeSettleProofData1, flexEncodeSettleProofData2 } from '../settleProof';

export interface FlexEncodeSettleNativeProofDataParams {
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
  amount: AsHexValue;
  deadline: AsHexValue;
  eventChain: AsHexValue;
  eventSignature: AsHexValue;
  confirm: boolean;
}

export interface FlexSettleNativeProofData {
  receiveData: [AsHexValue, AsHexValue],
  settleProofData: [AsHexValue, AsHexValue, AsHexValue],
}

export function flexEncodeSettleNativeProofData(params: FlexEncodeSettleNativeProofDataParams): FlexSettleNativeProofData {
  const receiveData: FlexSettleNativeProofData['receiveData'] = [
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

  const settleProofData: FlexSettleNativeProofData['settleProofData'] = [
    flexEncodeSettleProofData0({
      confirm: params.confirm,
      receiver: params.receiver,
      eventChain: params.eventChain,
    }),
    flexEncodeSettleProofData1({
      eventSignature: params.eventSignature,
    }),
    flexEncodeSettleProofData2({
      receiveHash: flexCalcReceiveHash({ data: receiveData, }),
    }),
  ];

  const data: FlexSettleNativeProofData = {
    receiveData,
    settleProofData,
  };
  return data;
};
