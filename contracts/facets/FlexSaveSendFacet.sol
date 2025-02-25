// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSaveSend} from "../interfaces/IFlexSaveSend.sol";

import {FlexSendSave} from "../interfaces/events/FlexSendSave.sol";

import {FlexSaveSendData} from "../libraries/data/FlexSaveSendData.sol";

import {FlexSendStateBucket} from "../libraries/storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../libraries/storages/FlexSendStateStorage.sol";
import {FlexSaveSendStateBucket} from "../libraries/storages/FlexSaveSendStateBucket.sol";
import {FlexSaveSendStateStorage} from "../libraries/storages/FlexSaveSendStateStorage.sol";

import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexSaveSendFacet is IFlexSaveSend {
    function flexSaveSend(bytes32 saveData0_) external override {
        bytes32 bucket = FlexSendStateBucket.calcBucket(FlexSaveSendData.readSender(saveData0_), FlexSaveSendData.readGroup(saveData0_));
        bytes32 bucketState = FlexSendStateStorage.data()[bucket];
        bytes32 saveBucket = FlexSaveSendStateBucket.calcBucket(msg.sender, FlexSaveSendData.readSlot(saveData0_));
        FlexSaveSendStateStorage.data()[saveBucket] = FlexEfficientHash.calc(bucket, bucketState);
        emit FlexSendSave(bucket, bucketState, saveBucket);
    }
}
