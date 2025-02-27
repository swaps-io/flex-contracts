// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSettleTokenProofDomain} from "../../../interfaces/views/domains/IFlexSettleTokenProofDomain.sol";

import {IFlexSettleTokenProof} from "../../../interfaces/IFlexSettleTokenProof.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSettleTokenProofDomainFacet is IFlexSettleTokenProofDomain {
    bytes8 public immutable override flexSettleTokenProofDomain;

    constructor(address target_) {
        flexSettleTokenProofDomain = FlexDomain.calc(target_, IFlexSettleTokenProof.flexSettleTokenProof.selector);
    }
}
