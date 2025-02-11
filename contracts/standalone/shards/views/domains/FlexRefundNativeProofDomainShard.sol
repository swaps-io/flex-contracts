// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundNativeProofDomainFacet} from "../../../../facets/views/domains/FlexRefundNativeProofDomainFacet.sol";

import {IFlexRefundNativeProof} from "../../../../interfaces/IFlexRefundNativeProof.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundNativeProofDomainShard is FlexRefundNativeProofDomainFacet {
    constructor()
        FlexRefundNativeProofDomainFacet(
            FlexStandaloneDomain.calc(IFlexRefundNativeProof.flexRefundNativeProof.selector)
        )
    {}
}
