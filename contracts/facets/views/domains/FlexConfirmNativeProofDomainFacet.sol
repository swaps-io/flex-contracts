// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmNativeProofDomain} from "../../../interfaces/views/domains/IFlexConfirmNativeProofDomain.sol";

contract FlexConfirmNativeProofDomainFacet is IFlexConfirmNativeProofDomain {
    bytes32 public immutable override flexConfirmNativeProofDomain;

    constructor(bytes32 domain_) {
        flexConfirmNativeProofDomain = domain_;
    }
}
