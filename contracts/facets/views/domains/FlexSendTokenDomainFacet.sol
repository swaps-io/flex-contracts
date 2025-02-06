// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendTokenDomain} from "../../../interfaces/views/domains/IFlexSendTokenDomain.sol";

contract FlexSendTokenDomainFacet is IFlexSendTokenDomain {
    bytes32 public immutable override flexSendTokenDomain;

    constructor(bytes32 domain_) {
        flexSendTokenDomain = domain_;
    }
}
