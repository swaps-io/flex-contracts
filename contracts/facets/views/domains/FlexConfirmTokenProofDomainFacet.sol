// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmTokenProofDomain} from "../../../interfaces/views/domains/IFlexConfirmTokenProofDomain.sol";

contract FlexConfirmTokenProofDomainFacet is IFlexConfirmTokenProofDomain {
    bytes32 public immutable override flexConfirmTokenProofDomain;

    constructor(bytes32 domain_) {
        flexConfirmTokenProofDomain = domain_;
    }
}
