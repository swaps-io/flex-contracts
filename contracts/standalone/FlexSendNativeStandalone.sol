// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendNativeFacet} from "../facets/FlexSendNativeFacet.sol";
import {FlexSendNativeDomainFacet} from "../facets/FlexSendNativeDomainFacet.sol";
import {FlexSendTimeFacet} from "../facets/FlexSendTimeFacet.sol";
import {FlexSendHashFacet} from "../facets/FlexSendHashFacet.sol";

contract FlexSendNativeStandalone is
    FlexSendNativeFacet,
    FlexSendNativeDomainFacet,
    FlexSendTimeFacet,
    FlexSendHashFacet
{
    constructor(bytes32 sendNativeDomain_)
        FlexSendNativeFacet(sendNativeDomain_)
        FlexSendNativeDomainFacet(sendNativeDomain_)
    {}
}
