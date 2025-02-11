// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmTokenProofDomain} from "../../../interfaces/views/domains/IFlexConfirmTokenProofDomain.sol";

import {IFlexConfirmTokenProof} from "../../../interfaces/IFlexConfirmTokenProof.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexConfirmTokenProofDomainFacet is IFlexConfirmTokenProofDomain {
    bytes8 public immutable override flexConfirmTokenProofDomain;

    constructor(address target_) {
        flexConfirmTokenProofDomain = FlexDomain.calc(target_, IFlexConfirmTokenProof.flexConfirmTokenProof.selector);
    }
}
