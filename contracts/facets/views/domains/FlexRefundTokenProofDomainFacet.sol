// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundTokenProofDomain} from "../../../interfaces/views/domains/IFlexRefundTokenProofDomain.sol";

import {IFlexRefundTokenProof} from "../../../interfaces/IFlexRefundTokenProof.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexRefundTokenProofDomainFacet is IFlexRefundTokenProofDomain {
    bytes8 public immutable override flexRefundTokenProofDomain;

    constructor(address target_) {
        flexRefundTokenProofDomain = FlexDomain.calc(target_, IFlexRefundTokenProof.flexRefundTokenProof.selector);
    }
}
