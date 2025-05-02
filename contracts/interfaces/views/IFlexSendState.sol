// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexSendState} from "../enums/FlexSendState.sol";

interface IFlexSendState {
    function flexSendState(address sender, uint96 nonce) external view returns (FlexSendState);
}
