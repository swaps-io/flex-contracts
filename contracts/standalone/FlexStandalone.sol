// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexAllocateReceiveFacet} from "../facets/FlexAllocateReceiveFacet.sol";
import {FlexAllocateSendFacet} from "../facets/FlexAllocateSendFacet.sol";
import {FlexReceiveNativeFacet} from "../facets/FlexReceiveNativeFacet.sol";
import {FlexReceiveTokenFacet} from "../facets/FlexReceiveTokenFacet.sol";
import {FlexReceiveTokenFromFacet} from "../facets/FlexReceiveTokenFromFacet.sol";
import {FlexSendNativeFacet} from "../facets/FlexSendNativeFacet.sol";
import {FlexSendTokenFacet} from "../facets/FlexSendTokenFacet.sol";
import {FlexSettleNativeFacet} from "../facets/FlexSettleNativeFacet.sol";
import {FlexSettleNativeProofFacet} from "../facets/FlexSettleNativeProofFacet.sol";
import {FlexSettleTokenFacet} from "../facets/FlexSettleTokenFacet.sol";
import {FlexSettleTokenProofFacet} from "../facets/FlexSettleTokenProofFacet.sol";

import {FlexProofVerifierFacet} from "../facets/views/FlexProofVerifierFacet.sol";
import {FlexReceiveHashFacet} from "../facets/views/FlexReceiveHashFacet.sol";
import {FlexReceiveStateFacet} from "../facets/views/FlexReceiveStateFacet.sol";
import {FlexSendHashFacet} from "../facets/views/FlexSendHashFacet.sol";
import {FlexSendTimeFacet} from "../facets/views/FlexSendTimeFacet.sol";

import {FlexReceiveNativeDomainFacet} from "../facets/views/domains/FlexReceiveNativeDomainFacet.sol";
import {FlexReceiveTokenDomainFacet} from "../facets/views/domains/FlexReceiveTokenDomainFacet.sol";
import {FlexReceiveTokenFromDomainFacet} from "../facets/views/domains/FlexReceiveTokenFromDomainFacet.sol";
import {FlexSendNativeDomainFacet} from "../facets/views/domains/FlexSendNativeDomainFacet.sol";
import {FlexSendTokenDomainFacet} from "../facets/views/domains/FlexSendTokenDomainFacet.sol";
import {FlexSettleNativeDomainFacet} from "../facets/views/domains/FlexSettleNativeDomainFacet.sol";
import {FlexSettleNativeProofDomainFacet} from "../facets/views/domains/FlexSettleNativeProofDomainFacet.sol";
import {FlexSettleTokenDomainFacet} from "../facets/views/domains/FlexSettleTokenDomainFacet.sol";
import {FlexSettleTokenProofDomainFacet} from "../facets/views/domains/FlexSettleTokenProofDomainFacet.sol";

contract FlexStandalone is
    FlexAllocateReceiveFacet,
    FlexAllocateSendFacet,
    FlexReceiveNativeFacet,
    FlexReceiveTokenFacet,
    FlexReceiveTokenFromFacet,
    FlexSendNativeFacet,
    FlexSendTokenFacet,
    FlexSettleNativeFacet,
    FlexSettleNativeProofFacet,
    FlexSettleTokenFacet,
    FlexSettleTokenProofFacet,
    FlexProofVerifierFacet,
    FlexReceiveHashFacet,
    FlexReceiveStateFacet,
    FlexSendHashFacet,
    FlexSendTimeFacet,
    FlexReceiveNativeDomainFacet,
    FlexReceiveTokenDomainFacet,
    FlexReceiveTokenFromDomainFacet,
    FlexSendNativeDomainFacet,
    FlexSendTokenDomainFacet,
    FlexSettleNativeDomainFacet,
    FlexSettleNativeProofDomainFacet,
    FlexSettleTokenDomainFacet,
    FlexSettleTokenProofDomainFacet
{
    constructor(address proofVerifier_)
        FlexSettleNativeProofFacet(proofVerifier_)
        FlexSettleTokenProofFacet(proofVerifier_)
        FlexProofVerifierFacet(proofVerifier_)
        FlexReceiveNativeDomainFacet(address(this))
        FlexReceiveTokenDomainFacet(address(this))
        FlexReceiveTokenFromDomainFacet(address(this))
        FlexSendNativeDomainFacet(address(this))
        FlexSendTokenDomainFacet(address(this))
        FlexSettleNativeDomainFacet(address(this))
        FlexSettleNativeProofDomainFacet(address(this))
        FlexSettleTokenDomainFacet(address(this))
        FlexSettleTokenProofDomainFacet(address(this))
    {}
}
