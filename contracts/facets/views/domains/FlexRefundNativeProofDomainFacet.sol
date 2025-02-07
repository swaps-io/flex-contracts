// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundNativeProofDomain} from "../../../interfaces/views/domains/IFlexRefundNativeProofDomain.sol";

contract FlexRefundNativeProofDomainFacet is IFlexRefundNativeProofDomain {
    bytes32 public immutable override flexRefundNativeProofDomain;

    constructor(bytes32 domain_) {
        flexRefundNativeProofDomain = domain_;
    }
}
