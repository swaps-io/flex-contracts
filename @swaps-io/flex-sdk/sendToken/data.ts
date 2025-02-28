import { AsHexValue, Hex } from '../external';

import { flexEncodeSendData0, flexEncodeSendData1, flexEncodeSendData2, flexEncodeSendData3 } from '../send';

export interface FlexEncodeSendTokenDataParams {
  sender: AsHexValue;
  receiver: AsHexValue;
  token: AsHexValue;
  amount: AsHexValue;
  start: AsHexValue;
  duration: AsHexValue;
  group: AsHexValue;
}

export interface FlexSendTokenData {
  sendData: [Hex, Hex, Hex, Hex];
}

export function flexEncodeSendTokenData(params: FlexEncodeSendTokenDataParams): FlexSendTokenData {
  const sendData: FlexSendTokenData['sendData'] = [
    flexEncodeSendData0({
      sender: params.sender,
    }),
    flexEncodeSendData1({
      start: params.start,
      duration: params.duration,
      group: params.group,
      receiver: params.receiver,
    }),
    flexEncodeSendData2({
      amount: params.amount,
    }),
    flexEncodeSendData3({
      token: params.token,
    }),
  ];

  const data: FlexSendTokenData = {
    sendData,
  };
  return data;
};
