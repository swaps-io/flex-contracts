// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendTokenFacet} from "../facets/FlexSendTokenFacet.sol";
import {FlexSendTokenDomainFacet} from "../facets/FlexSendTokenDomainFacet.sol";
import {FlexSendTimeFacet} from "../facets/FlexSendTimeFacet.sol";
import {FlexSendHashFacet} from "../facets/FlexSendHashFacet.sol";

contract FlexSendTokenStandalone is
    FlexSendTokenFacet,
    FlexSendTokenDomainFacet,
    FlexSendTimeFacet,
    FlexSendHashFacet
{
    constructor(bytes32 sendTokenDomain_)
        FlexSendTokenFacet(sendTokenDomain_)
        FlexSendTokenDomainFacet(sendTokenDomain_)
    {}
}
