// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmTokenDomain} from "../interfaces/IFlexConfirmTokenDomain.sol";

contract FlexConfirmTokenDomainFacet is IFlexConfirmTokenDomain {
    bytes32 public immutable override flexConfirmTokenDomain;

    constructor(bytes32 domain_) {
        flexConfirmTokenDomain = domain_;
    }
}
