// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeFacet} from "../../facets/FlexReceiveNativeFacet.sol";
import {FlexConfirmNativeFacet} from "../../facets/FlexConfirmNativeFacet.sol";
import {FlexRefundNativeFacet} from "../../facets/FlexRefundNativeFacet.sol";

import {FlexReceiveStateFacet} from "../../facets/views/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../../facets/views/FlexReceiveHashFacet.sol";

import {FlexReceiveNativeDomainFacet} from "../../facets/views/domains/FlexReceiveNativeDomainFacet.sol";
import {FlexConfirmNativeDomainFacet} from "../../facets/views/domains/FlexConfirmNativeDomainFacet.sol";
import {FlexRefundNativeDomainFacet} from "../../facets/views/domains/FlexRefundNativeDomainFacet.sol";

contract FlexReceiveNativeStandalone is
    FlexReceiveNativeFacet,
    FlexReceiveNativeDomainFacet,
    FlexReceiveStateFacet,
    FlexReceiveHashFacet,
    FlexConfirmNativeFacet,
    FlexConfirmNativeDomainFacet,
    FlexRefundNativeFacet,
    FlexRefundNativeDomainFacet
{
    constructor(
        bytes32 receiveNativeDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 refundNativeDomain_
    )
        FlexReceiveNativeFacet(receiveNativeDomain_)
        FlexReceiveNativeDomainFacet(receiveNativeDomain_)
        FlexConfirmNativeFacet(confirmNativeDomain_, receiveNativeDomain_)
        FlexConfirmNativeDomainFacet(confirmNativeDomain_)
        FlexRefundNativeFacet(refundNativeDomain_, receiveNativeDomain_)
        FlexRefundNativeDomainFacet(refundNativeDomain_)
    {}
}
