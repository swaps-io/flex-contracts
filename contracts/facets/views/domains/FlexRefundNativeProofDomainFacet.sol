// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundNativeProofDomain} from "../../../interfaces/views/domains/IFlexRefundNativeProofDomain.sol";

import {IFlexRefundNativeProof} from "../../../interfaces/IFlexRefundNativeProof.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexRefundNativeProofDomainFacet is IFlexRefundNativeProofDomain {
    bytes8 public immutable override flexRefundNativeProofDomain;

    constructor(address target_) {
        flexRefundNativeProofDomain = FlexDomain.calc(target_, IFlexRefundNativeProof.flexRefundNativeProof.selector);
    }
}
