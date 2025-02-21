// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendSave} from "../../interfaces/views/IFlexSendSave.sol";

import {FlexSaveSendStateBucket} from "../../libraries/storages/FlexSaveSendStateBucket.sol";
import {FlexSaveSendStateStorage} from "../../libraries/storages/FlexSaveSendStateStorage.sol";

contract FlexSendSaveFacet is IFlexSendSave {
    function flexSendSave(address saver_, uint48 group_) external view override returns (bytes32) {
        bytes32 saveBucket = FlexSaveSendStateBucket.calcBucket(saver_, group_);
        return FlexSaveSendStateStorage.data()[saveBucket];
    }
}
