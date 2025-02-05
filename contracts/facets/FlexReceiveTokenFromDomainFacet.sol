// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveTokenFromDomain} from "../interfaces/IFlexReceiveTokenFromDomain.sol";

contract FlexReceiveTokenFromDomainFacet is IFlexReceiveTokenFromDomain {
    bytes32 public immutable override flexReceiveTokenFromDomain;

    constructor(bytes32 domain_) {
        flexReceiveTokenFromDomain = domain_;
    }
}
