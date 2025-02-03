// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveTokenDomain} from "../interfaces/IFlexReceiveTokenDomain.sol";

contract FlexReceiveTokenDomainFacet is IFlexReceiveTokenDomain {
    bytes32 public immutable override flexReceiveTokenDomain;

    constructor(bytes32 domain_) {
        flexReceiveTokenDomain = domain_;
    }
}
