import { AsHexValue, Hex } from '../external';

import { flexEncodeSendData0, flexEncodeSendData1, flexEncodeSendData3 } from '../send';
import { flexEncodeSendFloatData2 } from '../sendFloat';

export interface FlexEncodeSendTokenFloatDataParams {
  sender: AsHexValue;
  receiver: AsHexValue;
  token: AsHexValue;
  amount: AsHexValue;
  start: AsHexValue;
  duration: AsHexValue;
  group: AsHexValue;
  skipAmountEmit?: boolean;
}

export interface FlexSendTokenFloatData {
  sendData: [Hex, Hex, Hex, Hex],
}

export function flexEncodeSendTokenFloatData(params: FlexEncodeSendTokenFloatDataParams): FlexSendTokenFloatData {
  const sendData: FlexSendTokenFloatData['sendData'] = [
    flexEncodeSendData0({
      sender: params.sender,
    }),
    flexEncodeSendData1({
      start: params.start,
      duration: params.duration,
      group: params.group,
      receiver: params.receiver,
    }),
    flexEncodeSendFloatData2({
      amount: params.amount,
      skipAmountEmit: params.skipAmountEmit,
    }),
    flexEncodeSendData3({
      token: params.token,
    }),
  ];

  const data: FlexSendTokenFloatData = {
    sendData,
  };
  return data;
};
