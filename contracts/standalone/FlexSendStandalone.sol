// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendNativeStandalone} from "./FlexSendNativeStandalone.sol";
import {FlexSendTokenStandalone} from "./FlexSendTokenStandalone.sol";

contract FlexSendStandalone is
    FlexSendNativeStandalone,
    FlexSendTokenStandalone
{
    constructor(
        bytes32 sendNativeDomain_,
        bytes32 sendTokenDomain_
    )
        FlexSendNativeStandalone(sendNativeDomain_)
        FlexSendTokenStandalone(sendTokenDomain_)
    {}
}
