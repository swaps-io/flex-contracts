// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendTokenFacet} from "../../facets/FlexSendTokenFacet.sol";
import {FlexAllocateSendFacet} from "../../facets/FlexAllocateSendFacet.sol";

import {FlexSendTimeFacet} from "../../facets/views/FlexSendTimeFacet.sol";
import {FlexSendHashFacet} from "../../facets/views/FlexSendHashFacet.sol";

import {FlexSendTokenDomainFacet} from "../../facets/views/domains/FlexSendTokenDomainFacet.sol";

contract FlexSendTokenStandalone is
    FlexSendTokenFacet,
    FlexSendTokenDomainFacet,
    FlexSendTimeFacet,
    FlexSendHashFacet,
    FlexAllocateSendFacet
{
    constructor(bytes32 sendTokenDomain_)
        FlexSendTokenFacet(sendTokenDomain_)
        FlexSendTokenDomainFacet(sendTokenDomain_)
    {}
}
