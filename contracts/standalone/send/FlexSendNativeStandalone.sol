// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendNativeFacet} from "../../facets/FlexSendNativeFacet.sol";
import {FlexAllocateSendFacet} from "../../facets/FlexAllocateSendFacet.sol";

import {FlexSendTimeFacet} from "../../facets/views/FlexSendTimeFacet.sol";
import {FlexSendHashFacet} from "../../facets/views/FlexSendHashFacet.sol";

import {FlexSendNativeDomainFacet} from "../../facets/views/domains/FlexSendNativeDomainFacet.sol";

contract FlexSendNativeStandalone is
    FlexSendNativeFacet,
    FlexSendNativeDomainFacet,
    FlexSendTimeFacet,
    FlexSendHashFacet,
    FlexAllocateSendFacet
{
    constructor(bytes32 sendNativeDomain_)
        FlexSendNativeFacet(sendNativeDomain_)
        FlexSendNativeDomainFacet(sendNativeDomain_)
    {}
}
