// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexReceiveState} from "../enums/FlexReceiveState.sol";

interface IFlexReceiveState {
    function flexReceiveState(address receiver, uint96 nonce) external view returns (FlexReceiveState);
}
