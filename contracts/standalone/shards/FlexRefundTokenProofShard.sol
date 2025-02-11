// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundTokenProofFacet} from "../../facets/FlexRefundTokenProofFacet.sol";

import {IFlexReceiveToken} from "../../interfaces/IFlexReceiveToken.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundTokenProofShard is FlexRefundTokenProofFacet {
    constructor(address proofVerifier_)
        FlexRefundTokenProofFacet(
            FlexStandaloneDomain.calc(FlexRefundTokenProofFacet.flexRefundTokenProof.selector),
            FlexStandaloneDomain.calc(IFlexReceiveToken.flexReceiveToken.selector),
            proofVerifier_
        )
    {}
}
