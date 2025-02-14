import { AsHexValue, Hex } from '../external';

import { flexEncodeSendData0, flexEncodeSendData1, flexEncodeSendData2 } from '../send';

export interface FlexEncodeSendNativeDataParams {
  sender: AsHexValue;
  receiver: AsHexValue;
  amount: AsHexValue;
  start: AsHexValue;
  time: AsHexValue;
  group: AsHexValue;
}

export interface FlexSendNativeData {
  sendData: [Hex, Hex, Hex],
}

export function flexEncodeSendNativeData(params: FlexEncodeSendNativeDataParams): FlexSendNativeData {
  const sendData: FlexSendNativeData['sendData'] = [
    flexEncodeSendData0({
      sender: params.sender,
    }),
    flexEncodeSendData1({
      start: params.start,
      time: params.time,
      group: params.group,
      receiver: params.receiver,
    }),
    flexEncodeSendData2({
      amount: params.amount,
    }),
  ];

  const data: FlexSendNativeData = {
    sendData,
  };
  return data;
};
