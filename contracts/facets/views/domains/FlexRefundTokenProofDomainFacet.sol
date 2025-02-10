// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundTokenProofDomain} from "../../../interfaces/views/domains/IFlexRefundTokenProofDomain.sol";

contract FlexRefundTokenProofDomainFacet is IFlexRefundTokenProofDomain {
    bytes32 public immutable override flexRefundTokenProofDomain;

    constructor(bytes32 domain_) {
        flexRefundTokenProofDomain = domain_;
    }
}
