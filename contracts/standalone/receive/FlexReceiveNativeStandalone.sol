// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeFacet} from "../../facets/FlexReceiveNativeFacet.sol";
import {FlexConfirmNativeFacet} from "../../facets/FlexConfirmNativeFacet.sol";
import {FlexConfirmNativeProofFacet} from "../../facets/FlexConfirmNativeProofFacet.sol";
import {FlexRefundNativeFacet} from "../../facets/FlexRefundNativeFacet.sol";
import {FlexRefundNativeProofFacet} from "../../facets/FlexRefundNativeProofFacet.sol";
import {FlexAllocateReceiveFacet} from "../../facets/FlexAllocateReceiveFacet.sol";

import {FlexReceiveStateFacet} from "../../facets/views/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../../facets/views/FlexReceiveHashFacet.sol";

import {FlexReceiveNativeDomainFacet} from "../../facets/views/domains/FlexReceiveNativeDomainFacet.sol";
import {FlexConfirmNativeDomainFacet} from "../../facets/views/domains/FlexConfirmNativeDomainFacet.sol";
import {FlexConfirmNativeProofDomainFacet} from "../../facets/views/domains/FlexConfirmNativeProofDomainFacet.sol";
import {FlexRefundNativeDomainFacet} from "../../facets/views/domains/FlexRefundNativeDomainFacet.sol";
import {FlexRefundNativeProofDomainFacet} from "../../facets/views/domains/FlexRefundNativeProofDomainFacet.sol";

contract FlexReceiveNativeStandalone is
    FlexReceiveNativeFacet,
    FlexReceiveNativeDomainFacet,
    FlexReceiveStateFacet,
    FlexReceiveHashFacet,
    FlexConfirmNativeFacet,
    FlexConfirmNativeDomainFacet,
    FlexConfirmNativeProofFacet,
    FlexConfirmNativeProofDomainFacet,
    FlexRefundNativeFacet,
    FlexRefundNativeDomainFacet,
    FlexRefundNativeProofFacet,
    FlexRefundNativeProofDomainFacet,
    FlexAllocateReceiveFacet
{
    constructor(
        bytes32 receiveNativeDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 confirmNativeProofDomain_,
        bytes32 refundNativeDomain_,
        bytes32 refundNativeProofDomain_,
        address proofVerifier_
    )
        FlexReceiveNativeFacet(receiveNativeDomain_)
        FlexReceiveNativeDomainFacet(receiveNativeDomain_)
        FlexConfirmNativeFacet(confirmNativeDomain_, receiveNativeDomain_)
        FlexConfirmNativeDomainFacet(confirmNativeDomain_)
        FlexConfirmNativeProofFacet(confirmNativeProofDomain_, receiveNativeDomain_, proofVerifier_)
        FlexConfirmNativeProofDomainFacet(confirmNativeProofDomain_)
        FlexRefundNativeFacet(refundNativeDomain_, receiveNativeDomain_)
        FlexRefundNativeDomainFacet(refundNativeDomain_)
        FlexRefundNativeProofFacet(refundNativeProofDomain_, receiveNativeDomain_, proofVerifier_)
        FlexRefundNativeProofDomainFacet(refundNativeProofDomain_)
    {}
}
