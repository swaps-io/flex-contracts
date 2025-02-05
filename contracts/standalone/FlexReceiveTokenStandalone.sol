// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveTokenFacet} from "../facets/FlexReceiveTokenFacet.sol";
import {FlexReceiveTokenDomainFacet} from "../facets/FlexReceiveTokenDomainFacet.sol";
import {FlexReceiveTokenFromFacet} from "../facets/FlexReceiveTokenFromFacet.sol";
import {FlexReceiveTokenFromDomainFacet} from "../facets/FlexReceiveTokenFromDomainFacet.sol";
import {FlexReceiveStateFacet} from "../facets/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../facets/FlexReceiveHashFacet.sol";
import {FlexConfirmTokenFacet} from "../facets/FlexConfirmTokenFacet.sol";
import {FlexConfirmTokenDomainFacet} from "../facets/FlexConfirmTokenDomainFacet.sol";
import {FlexRefundTokenFacet} from "../facets/FlexRefundTokenFacet.sol";
import {FlexRefundTokenDomainFacet} from "../facets/FlexRefundTokenDomainFacet.sol";

contract FlexReceiveTokenStandalone is
    FlexReceiveTokenFacet,
    FlexReceiveTokenDomainFacet,
    FlexReceiveTokenFromFacet,
    FlexReceiveTokenFromDomainFacet,
    FlexReceiveStateFacet,
    FlexReceiveHashFacet,
    FlexConfirmTokenFacet,
    FlexConfirmTokenDomainFacet,
    FlexRefundTokenFacet,
    FlexRefundTokenDomainFacet
{
    constructor(
        bytes32 receiveTokenDomain_,
        bytes32 receiveTokenFromDomain_,
        bytes32 confirmTokenDomain_,
        bytes32 refundTokenDomain_
    )
        FlexReceiveTokenFacet(receiveTokenDomain_)
        FlexReceiveTokenDomainFacet(receiveTokenDomain_)
        FlexReceiveTokenFromFacet(receiveTokenFromDomain_)
        FlexReceiveTokenFromDomainFacet(receiveTokenFromDomain_)
        FlexConfirmTokenFacet(confirmTokenDomain_, receiveTokenDomain_)
        FlexConfirmTokenDomainFacet(confirmTokenDomain_)
        FlexRefundTokenFacet(refundTokenDomain_, receiveTokenDomain_)
        FlexRefundTokenDomainFacet(refundTokenDomain_)
    {}
}
