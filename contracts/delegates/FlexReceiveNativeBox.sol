// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveNativeBox} from "./interfaces/IFlexReceiveNativeBox.sol";
import {FlexFactoryCallerError} from "./interfaces/FlexFactoryCallerError.sol";
import {FlexNativeSendError} from "./interfaces/FlexNativeSendError.sol";

contract FlexReceiveNativeBox is IFlexReceiveNativeBox {
    address private immutable _factory;

    constructor(address factory_) {
        _factory = factory_;
    }

    modifier onlyFactory() {
        require(msg.sender == _factory, FlexFactoryCallerError());
        _;
    }

    function takeNative(address to_) external onlyFactory {
        (bool success, ) = to_.call{value: address(this).balance}("");
        require(success, FlexNativeSendError());
    }
}
