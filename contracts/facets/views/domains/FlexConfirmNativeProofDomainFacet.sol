// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmNativeProofDomain} from "../../../interfaces/views/domains/IFlexConfirmNativeProofDomain.sol";

import {IFlexConfirmNativeProof} from "../../../interfaces/IFlexConfirmNativeProof.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexConfirmNativeProofDomainFacet is IFlexConfirmNativeProofDomain {
    bytes8 public immutable override flexConfirmNativeProofDomain;

    constructor(address target_) {
        flexConfirmNativeProofDomain = FlexDomain.calc(target_, IFlexConfirmNativeProof.flexConfirmNativeProof.selector);
    }
}
