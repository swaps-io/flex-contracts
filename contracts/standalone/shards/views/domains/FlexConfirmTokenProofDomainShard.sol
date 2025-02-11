// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmTokenProofDomainFacet} from "../../../../facets/views/domains/FlexConfirmTokenProofDomainFacet.sol";

import {IFlexConfirmTokenProof} from "../../../../interfaces/IFlexConfirmTokenProof.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmTokenProofDomainShard is FlexConfirmTokenProofDomainFacet {
    constructor()
        FlexConfirmTokenProofDomainFacet(
            FlexStandaloneDomain.calc(IFlexConfirmTokenProof.flexConfirmTokenProof.selector)
        )
    {}
}
