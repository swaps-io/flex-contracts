// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveTokenFacet} from "../../facets/FlexReceiveTokenFacet.sol";
import {FlexReceiveTokenFromFacet} from "../../facets/FlexReceiveTokenFromFacet.sol";
import {FlexConfirmTokenFacet} from "../../facets/FlexConfirmTokenFacet.sol";
import {FlexRefundTokenFacet} from "../../facets/FlexRefundTokenFacet.sol";
import {FlexAllocateReceiveFacet} from "../../facets/FlexAllocateReceiveFacet.sol";

import {FlexReceiveStateFacet} from "../../facets/views/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../../facets/views/FlexReceiveHashFacet.sol";

import {FlexReceiveTokenDomainFacet} from "../../facets/views/domains/FlexReceiveTokenDomainFacet.sol";
import {FlexReceiveTokenFromDomainFacet} from "../../facets/views/domains/FlexReceiveTokenFromDomainFacet.sol";
import {FlexConfirmTokenDomainFacet} from "../../facets/views/domains/FlexConfirmTokenDomainFacet.sol";
import {FlexRefundTokenDomainFacet} from "../../facets/views/domains/FlexRefundTokenDomainFacet.sol";

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
    FlexRefundTokenDomainFacet,
    FlexAllocateReceiveFacet
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
