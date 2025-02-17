// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexPreserveSend} from "../interfaces/IFlexPreserveSend.sol";

import {FlexPreserveSend} from "../interfaces/events/FlexPreserveSend.sol";

import {FlexPreserveSendData} from "../libraries/data/FlexPreserveSendData.sol";

import {FlexSendStateBucket} from "../libraries/storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../libraries/storages/FlexSendStateStorage.sol";
import {FlexPreserveSendStateBucket} from "../libraries/storages/FlexPreserveSendStateBucket.sol";
import {FlexPreserveSendStateStorage} from "../libraries/storages/FlexPreserveSendStateStorage.sol";

import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexPreserveSendFacet is IFlexPreserveSend {
    function flexPreserveSend(bytes32 preserveData0_) external {
        bytes32 bucket = FlexSendStateBucket.calcBucket(FlexPreserveSendData.readSender(preserveData0_), FlexPreserveSendData.readGroup(preserveData0_));
        bytes32 bucketState = FlexSendStateStorage.data()[bucket];
        bytes32 preserveBucket = FlexPreserveSendStateBucket.calcBucket(msg.sender, FlexPreserveSendData.readIndex(preserveData0_));
        FlexPreserveSendStateStorage.data()[preserveBucket] = FlexEfficientHash.calc(bucket, bucketState);
        emit FlexPreserveSend(bucket, bucketState, preserveBucket);
    }
}
