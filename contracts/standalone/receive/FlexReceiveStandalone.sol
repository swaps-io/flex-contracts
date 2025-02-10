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
        bytes32 receiveTokenFromDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 confirmNativeProofDomain_,
        bytes32 confirmTokenDomain_,
        bytes32 confirmTokenProofDomain_,
        bytes32 refundNativeDomain_,
        bytes32 refundNativeProofDomain_,
        bytes32 refundTokenDomain_,
        bytes32 refundTokenProofDomain_,
        address proofVerifier_
    )
        FlexReceiveNativeStandalone(
            receiveNativeDomain_,
            confirmNativeDomain_,
            confirmNativeProofDomain_,
            refundNativeDomain_,
            refundNativeProofDomain_,
            proofVerifier_
        )
        FlexReceiveTokenStandalone(
            receiveTokenDomain_,
            receiveTokenFromDomain_,
            confirmTokenDomain_,
            confirmTokenProofDomain_,
            refundTokenDomain_,
            refundTokenProofDomain_,
            proofVerifier_
        )
    {}
}
