// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexStateConstraint} from "../constraints/FlexStateConstraint.sol";
import {FlexAccumulatorConstraint} from "../constraints/FlexAccumulatorConstraint.sol";

import {FlexReceive} from "../../interfaces/events/FlexReceive.sol";
import {FlexConfirm} from "../../interfaces/events/FlexConfirm.sol";
import {FlexRefund} from "../../interfaces/events/FlexRefund.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";

import {FlexReceiveStateAccess, FlexReceiveState} from "../accesses/FlexReceiveStateAccess.sol";

import {FlexHashAccumulator} from "../utilities/FlexHashAccumulator.sol";

library FlexReceiveStateUpdate {
    function toReceived(bytes32 receiveData0_, bytes32 orderHash_) internal {
        (bytes32 bucket, uint8 offset) = _locateReceive(receiveData0_);

        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        FlexStateConstraint.validate(bucketState, offset, FlexReceiveState.None);
        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Received);

        bytes20 receiveHash = FlexReceiveStateAccess.readHash(bucketState);
        receiveHash = FlexHashAccumulator.accumulate(receiveHash, orderHash_);
        bucketState = FlexReceiveStateAccess.writeHash(bucketState, receiveHash);

        FlexReceiveStateStorage.data()[bucket] = bucketState;
        emit FlexReceive(orderHash_);
    }

    function toSettled(bytes32 receiveData0_, bytes32 settleData0_, bytes32 orderHash_, bytes20 receiveHashBefore_, bytes32[] calldata receiveOrderHashesAfter_) internal {
        (bytes32 bucket, uint8 offset) = _locateReceive(receiveData0_);

        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        FlexStateConstraint.validate(bucketState, offset, FlexReceiveState.Received);
        FlexAccumulatorConstraint.validate(FlexReceiveStateAccess.readHash(bucketState), receiveHashBefore_, orderHash_, receiveOrderHashesAfter_);

        if (uint256(settleData0_ >> 160) & 1 == 0) {
            FlexReceiveStateStorage.data()[bucket] = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Refunded);
            emit FlexRefund(orderHash_);
        } else {
            FlexReceiveStateStorage.data()[bucket] = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Confirmed);
            emit FlexConfirm(orderHash_);
        }
    }

    function _locateReceive(bytes32 receiveData0_) private pure returns (bytes32 bucket, uint8 offset) {
        uint96 nonce = uint48(uint256(receiveData0_ >> 160));
        bucket = FlexReceiveStateAccess.calcBucket(address(uint160(uint256(receiveData0_))), nonce);
        offset = FlexReceiveStateAccess.calcOffset(nonce);
    }
}
