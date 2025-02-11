// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveTokenFacet} from "../../facets/FlexReceiveTokenFacet.sol";
import {FlexConfirmTokenFacet} from "../../facets/FlexConfirmTokenFacet.sol";
import {FlexConfirmTokenProofFacet} from "../../facets/FlexConfirmTokenProofFacet.sol";
import {FlexRefundTokenFacet} from "../../facets/FlexRefundTokenFacet.sol";
import {FlexRefundTokenProofFacet} from "../../facets/FlexRefundTokenProofFacet.sol";
import {FlexAllocateReceiveFacet} from "../../facets/FlexAllocateReceiveFacet.sol";

import {FlexReceiveStateFacet} from "../../facets/views/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../../facets/views/FlexReceiveHashFacet.sol";

import {FlexReceiveTokenDomainFacet} from "../../facets/views/domains/FlexReceiveTokenDomainFacet.sol";
import {FlexConfirmTokenDomainFacet} from "../../facets/views/domains/FlexConfirmTokenDomainFacet.sol";
import {FlexConfirmTokenProofDomainFacet} from "../../facets/views/domains/FlexConfirmTokenProofDomainFacet.sol";
import {FlexRefundTokenDomainFacet} from "../../facets/views/domains/FlexRefundTokenDomainFacet.sol";
import {FlexRefundTokenProofDomainFacet} from "../../facets/views/domains/FlexRefundTokenProofDomainFacet.sol";

contract FlexReceiveTokenStandalone is
    FlexReceiveTokenFacet,
    FlexReceiveTokenDomainFacet,
    FlexReceiveStateFacet,
    FlexReceiveHashFacet,
    FlexConfirmTokenFacet,
    FlexConfirmTokenDomainFacet,
    FlexConfirmTokenProofFacet,
    FlexConfirmTokenProofDomainFacet,
    FlexRefundTokenFacet,
    FlexRefundTokenDomainFacet,
    FlexRefundTokenProofFacet,
    FlexRefundTokenProofDomainFacet,
    FlexAllocateReceiveFacet
{
    constructor(
        bytes32 receiveTokenDomain_,
        bytes32 confirmTokenDomain_,
        bytes32 confirmTokenProofDomain_,
        bytes32 refundTokenDomain_,
        bytes32 refundTokenProofDomain_,
        address proofVerifier_
    )
        FlexReceiveTokenFacet(receiveTokenDomain_)
        FlexReceiveTokenDomainFacet(receiveTokenDomain_)
        FlexConfirmTokenFacet(confirmTokenDomain_, receiveTokenDomain_)
        FlexConfirmTokenDomainFacet(confirmTokenDomain_)
        FlexConfirmTokenProofFacet(confirmTokenProofDomain_, receiveTokenDomain_, proofVerifier_)
        FlexConfirmTokenProofDomainFacet(confirmTokenProofDomain_)
        FlexRefundTokenFacet(refundTokenDomain_, receiveTokenDomain_)
        FlexRefundTokenDomainFacet(refundTokenDomain_)
        FlexRefundTokenProofFacet(refundTokenProofDomain_, receiveTokenDomain_, proofVerifier_)
        FlexRefundTokenProofDomainFacet(refundTokenProofDomain_)
    {}
}
