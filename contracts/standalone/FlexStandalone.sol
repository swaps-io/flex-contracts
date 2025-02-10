// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveStandalone} from "./receive/FlexReceiveStandalone.sol";

import {FlexSendStandalone} from "./send/FlexSendStandalone.sol";

contract FlexStandalone is
    FlexReceiveStandalone,
    FlexSendStandalone
{
    constructor(
        bytes32 receiveNativeDomain_,
        bytes32 receiveTokenDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 confirmNativeProofDomain_,
        bytes32 confirmTokenDomain_,
        bytes32 confirmTokenProofDomain_,
        bytes32 refundNativeDomain_,
        bytes32 refundNativeProofDomain_,
        bytes32 refundTokenDomain_,
        bytes32 refundTokenProofDomain_,
        bytes32 sendNativeDomain_,
        bytes32 sendTokenDomain_,
        address proofVerifier_
    )
        FlexReceiveStandalone(
            receiveNativeDomain_,
            receiveTokenDomain_,
            confirmNativeDomain_,
            confirmNativeProofDomain_,
            confirmTokenDomain_,
            confirmTokenProofDomain_,
            refundNativeDomain_,
            refundNativeProofDomain_,
            refundTokenDomain_,
            refundTokenProofDomain_,
            proofVerifier_
        )
        FlexSendStandalone(
            sendNativeDomain_,
            sendTokenDomain_
        )
    {}
}
