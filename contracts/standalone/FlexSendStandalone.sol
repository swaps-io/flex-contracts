// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendNativeFacet} from "../facets/FlexSendNativeFacet.sol";
import {FlexSendNativeDomainFacet} from "../facets/FlexSendNativeDomainFacet.sol";
import {FlexSendTokenFacet} from "../facets/FlexSendTokenFacet.sol";
import {FlexSendTokenDomainFacet} from "../facets/FlexSendTokenDomainFacet.sol";
import {FlexSendTimeFacet} from "../facets/FlexSendTimeFacet.sol";
import {FlexSendHashFacet} from "../facets/FlexSendHashFacet.sol";

contract FlexSendStandalone is
    FlexSendNativeFacet,
    FlexSendNativeDomainFacet,
    FlexSendTokenFacet,
    FlexSendTokenDomainFacet,
    FlexSendTimeFacet,
    FlexSendHashFacet
{
    constructor(
        bytes32 sendNativeDomain_,
        bytes32 sendTokenDomain_
    )
        FlexSendNativeFacet(sendNativeDomain_)
        FlexSendNativeDomainFacet(sendNativeDomain_)
        FlexSendTokenFacet(sendTokenDomain_)
        FlexSendTokenDomainFacet(sendTokenDomain_)
    {}
}
