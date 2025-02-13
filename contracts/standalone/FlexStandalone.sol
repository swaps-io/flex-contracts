// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexAllocateReceiveFacet} from "../facets/FlexAllocateReceiveFacet.sol";
import {FlexAllocateSendFacet} from "../facets/FlexAllocateSendFacet.sol";
import {FlexConfirmNativeFacet} from "../facets/FlexConfirmNativeFacet.sol";
import {FlexConfirmNativeProofFacet} from "../facets/FlexConfirmNativeProofFacet.sol";
import {FlexConfirmTokenFacet} from "../facets/FlexConfirmTokenFacet.sol";
import {FlexConfirmTokenProofFacet} from "../facets/FlexConfirmTokenProofFacet.sol";
import {FlexReceiveNativeFacet} from "../facets/FlexReceiveNativeFacet.sol";
import {FlexReceiveTokenFacet} from "../facets/FlexReceiveTokenFacet.sol";
import {FlexReceiveTokenFromFacet} from "../facets/FlexReceiveTokenFromFacet.sol";
import {FlexRefundNativeFacet} from "../facets/FlexRefundNativeFacet.sol";
import {FlexRefundNativeProofFacet} from "../facets/FlexRefundNativeProofFacet.sol";
import {FlexRefundTokenFacet} from "../facets/FlexRefundTokenFacet.sol";
import {FlexRefundTokenProofFacet} from "../facets/FlexRefundTokenProofFacet.sol";
import {FlexSendNativeFacet} from "../facets/FlexSendNativeFacet.sol";
import {FlexSendTokenFacet} from "../facets/FlexSendTokenFacet.sol";

import {FlexProofVerifierFacet} from "../facets/views/FlexProofVerifierFacet.sol";
import {FlexReceiveHashFacet} from "../facets/views/FlexReceiveHashFacet.sol";
import {FlexReceiveStateFacet} from "../facets/views/FlexReceiveStateFacet.sol";
import {FlexSendHashFacet} from "../facets/views/FlexSendHashFacet.sol";
import {FlexSendTimeFacet} from "../facets/views/FlexSendTimeFacet.sol";

import {FlexConfirmNativeDomainFacet} from "../facets/views/domains/FlexConfirmNativeDomainFacet.sol";
import {FlexConfirmNativeProofDomainFacet} from "../facets/views/domains/FlexConfirmNativeProofDomainFacet.sol";
import {FlexConfirmTokenDomainFacet} from "../facets/views/domains/FlexConfirmTokenDomainFacet.sol";
import {FlexConfirmTokenProofDomainFacet} from "../facets/views/domains/FlexConfirmTokenProofDomainFacet.sol";
import {FlexReceiveNativeDomainFacet} from "../facets/views/domains/FlexReceiveNativeDomainFacet.sol";
import {FlexReceiveTokenDomainFacet} from "../facets/views/domains/FlexReceiveTokenDomainFacet.sol";
import {FlexReceiveTokenFromDomainFacet} from "../facets/views/domains/FlexReceiveTokenFromDomainFacet.sol";
import {FlexRefundNativeDomainFacet} from "../facets/views/domains/FlexRefundNativeDomainFacet.sol";
import {FlexRefundNativeProofDomainFacet} from "../facets/views/domains/FlexRefundNativeProofDomainFacet.sol";
import {FlexRefundTokenDomainFacet} from "../facets/views/domains/FlexRefundTokenDomainFacet.sol";
import {FlexRefundTokenProofDomainFacet} from "../facets/views/domains/FlexRefundTokenProofDomainFacet.sol";
import {FlexSendNativeDomainFacet} from "../facets/views/domains/FlexSendNativeDomainFacet.sol";
import {FlexSendTokenDomainFacet} from "../facets/views/domains/FlexSendTokenDomainFacet.sol";

contract FlexStandalone is
    FlexAllocateReceiveFacet,
    FlexAllocateSendFacet,
    FlexConfirmNativeFacet,
    FlexConfirmNativeProofFacet,
    FlexConfirmTokenFacet,
    FlexConfirmTokenProofFacet,
    FlexReceiveNativeFacet,
    FlexReceiveTokenFacet,
    FlexReceiveTokenFromFacet,
    FlexRefundNativeFacet,
    FlexRefundNativeProofFacet,
    FlexRefundTokenFacet,
    FlexRefundTokenProofFacet,
    FlexSendNativeFacet,
    FlexSendTokenFacet,
    FlexProofVerifierFacet,
    FlexReceiveHashFacet,
    FlexReceiveStateFacet,
    FlexSendHashFacet,
    FlexSendTimeFacet,
    FlexConfirmNativeDomainFacet,
    FlexConfirmNativeProofDomainFacet,
    FlexConfirmTokenDomainFacet,
    FlexConfirmTokenProofDomainFacet,
    FlexReceiveNativeDomainFacet,
    FlexReceiveTokenDomainFacet,
    FlexReceiveTokenFromDomainFacet,
    FlexRefundNativeDomainFacet,
    FlexRefundNativeProofDomainFacet,
    FlexRefundTokenDomainFacet,
    FlexRefundTokenProofDomainFacet,
    FlexSendNativeDomainFacet,
    FlexSendTokenDomainFacet
{
    constructor(address proofVerifier_)
        FlexConfirmNativeProofFacet(proofVerifier_)
        FlexConfirmTokenProofFacet(proofVerifier_)
        FlexRefundNativeProofFacet(proofVerifier_)
        FlexRefundTokenProofFacet(proofVerifier_)
        FlexProofVerifierFacet(proofVerifier_)
        FlexReceiveNativeDomainFacet(address(this))
        FlexReceiveTokenDomainFacet(address(this))
        FlexReceiveTokenFromDomainFacet(address(this))
        FlexConfirmNativeDomainFacet(address(this))
        FlexConfirmNativeProofDomainFacet(address(this))
        FlexConfirmTokenDomainFacet(address(this))
        FlexConfirmTokenProofDomainFacet(address(this))
        FlexRefundNativeDomainFacet(address(this))
        FlexRefundNativeProofDomainFacet(address(this))
        FlexRefundTokenDomainFacet(address(this))
        FlexRefundTokenProofDomainFacet(address(this))
        FlexSendNativeDomainFacet(address(this))
        FlexSendTokenDomainFacet(address(this))
    {}
}
