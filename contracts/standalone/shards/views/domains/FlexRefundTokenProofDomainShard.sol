// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundTokenProofDomainFacet} from "../../../../facets/views/domains/FlexRefundTokenProofDomainFacet.sol";

import {IFlexRefundTokenProof} from "../../../../interfaces/IFlexRefundTokenProof.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundTokenProofDomainShard is FlexRefundTokenProofDomainFacet {
    constructor()
        FlexRefundTokenProofDomainFacet(
            FlexStandaloneDomain.calc(IFlexRefundTokenProof.flexRefundTokenProof.selector)
        )
    {}
}
