// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSendSave} from "../../interfaces/views/IFlexSendSave.sol";

import {FlexSendSaveStateBucket} from "../../libraries/storages/FlexSendSaveStateBucket.sol";
import {FlexSendSaveStateStorage} from "../../libraries/storages/FlexSendSaveStateStorage.sol";

contract FlexSendSaveFacet is IFlexSendSave {
    function flexSendSave(address saver_, uint96 slot_) external view override returns (bytes32) {
        bytes32 saveBucket = FlexSendSaveStateBucket.calcBucket(saver_, slot_);
        return FlexSendSaveStateStorage.data()[saveBucket];
    }
}
