// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveStandalone} from "./FlexReceiveStandalone.sol";
import {FlexSendStandalone} from "./FlexSendStandalone.sol";

contract FlexStandalone is
    FlexReceiveStandalone,
    FlexSendStandalone
{
    constructor(
        bytes32 receiveNativeDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 sendNativeDomain_,
        bytes32 sendTokenDomain_
    )
        FlexReceiveStandalone(receiveNativeDomain_, confirmNativeDomain_)
        FlexSendStandalone(sendNativeDomain_, sendTokenDomain_)
    {}
}
