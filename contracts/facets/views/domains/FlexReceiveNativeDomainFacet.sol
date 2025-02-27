// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexReceiveNativeDomain} from "../../../interfaces/views/domains/IFlexReceiveNativeDomain.sol";

import {IFlexReceiveNative} from "../../../interfaces/IFlexReceiveNative.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexReceiveNativeDomainFacet is IFlexReceiveNativeDomain {
    bytes8 public immutable override flexReceiveNativeDomain;

    constructor(address target_) {
        flexReceiveNativeDomain = FlexDomain.calc(target_, IFlexReceiveNative.flexReceiveNative.selector);
    }
}
