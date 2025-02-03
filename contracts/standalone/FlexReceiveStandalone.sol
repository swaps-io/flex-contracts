// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeStandalone} from "./FlexReceiveNativeStandalone.sol";
import {FlexReceiveTokenStandalone} from "./FlexReceiveTokenStandalone.sol";

contract FlexReceiveStandalone is
    FlexReceiveNativeStandalone,
    FlexReceiveTokenStandalone
{
    constructor(
        bytes32 receiveNativeDomain_,
        bytes32 receiveTokenDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 confirmTokenDomain_,
        bytes32 refundNativeDomain_,
        bytes32 refundTokenDomain_
    )
        FlexReceiveNativeStandalone(
            receiveNativeDomain_,
            confirmNativeDomain_,
            refundNativeDomain_
        )
        FlexReceiveTokenStandalone(
            receiveTokenDomain_,
            confirmTokenDomain_,
            refundTokenDomain_
        )
    {}
}
