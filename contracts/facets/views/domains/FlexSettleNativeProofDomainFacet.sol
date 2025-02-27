// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSettleNativeProofDomain} from "../../../interfaces/views/domains/IFlexSettleNativeProofDomain.sol";

import {IFlexSettleNativeProof} from "../../../interfaces/IFlexSettleNativeProof.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSettleNativeProofDomainFacet is IFlexSettleNativeProofDomain {
    bytes8 public immutable override flexSettleNativeProofDomain;

    constructor(address target_) {
        flexSettleNativeProofDomain = FlexDomain.calc(target_, IFlexSettleNativeProof.flexSettleNativeProof.selector);
    }
}
