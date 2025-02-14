import { AsHexValue, Hex } from '../external';

import { flexCalcReceiveHash, flexEncodeReceiveData0, flexEncodeReceiveData1, flexEncodeReceiveData2 } from '../receive';
import { flexEncodeSettleProofData0, flexEncodeSettleProofData1, flexEncodeSettleProofData2 } from '../settleProof';

export interface FlexEncodeSettleTokenProofDataParams {
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
  token: AsHexValue;
  amount: AsHexValue;
  deadline: AsHexValue;
  eventChain: AsHexValue;
  eventSignature: AsHexValue;
  confirm: boolean;
}

export interface FlexSettleTokenProofData {
  receiveData: [Hex, Hex, Hex],
  settleProofData: [Hex, Hex, Hex],
}

export function flexEncodeSettleTokenProofData(params: FlexEncodeSettleTokenProofDataParams): FlexSettleTokenProofData {
  const receiveData: FlexSettleTokenProofData['receiveData'] = [
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

  const settleProofData: FlexSettleTokenProofData['settleProofData'] = [
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

  const data: FlexSettleTokenProofData = {
    receiveData,
    settleProofData,
  };
  return data;
};
