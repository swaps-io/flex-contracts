// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundTokenDomain} from "../interfaces/IFlexRefundTokenDomain.sol";

contract FlexRefundTokenDomainFacet is IFlexRefundTokenDomain {
    bytes32 public immutable override flexRefundTokenDomain;

    constructor(bytes32 domain_) {
        flexRefundTokenDomain = domain_;
    }
}
