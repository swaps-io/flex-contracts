// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmNativeProofDomainFacet} from "../../../../facets/views/domains/FlexConfirmNativeProofDomainFacet.sol";

import {IFlexConfirmNativeProof} from "../../../../interfaces/IFlexConfirmNativeProof.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmNativeProofDomainShard is FlexConfirmNativeProofDomainFacet {
    constructor()
        FlexConfirmNativeProofDomainFacet(
            FlexStandaloneDomain.calc(IFlexConfirmNativeProof.flexConfirmNativeProof.selector)
        )
    {}
}
