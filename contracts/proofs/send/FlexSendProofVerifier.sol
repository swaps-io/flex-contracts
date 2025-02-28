// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSendSave} from "../../interfaces/views/IFlexSendSave.sol";

import {FlexHashTree} from "../../libraries/utilities/FlexHashTree.sol";
import {FlexEfficientHash} from "../../libraries/utilities/FlexEfficientHash.sol";

import {FlexSendBucketStateData} from "../../libraries/data/FlexSendBucketStateData.sol";
import {FlexSendAccumulatorData} from "../../libraries/data/FlexSendAccumulatorData.sol";
import {FlexSendData} from "../../libraries/data/FlexSendData.sol";

import {FlexSendStateBucket} from "../../libraries/storages/FlexSendStateBucket.sol";

import {IFlexSendProofVerifier} from "./interfaces/IFlexSendProofVerifier.sol";
import {FlexSendProofData} from "./interfaces/FlexSendProofData.sol";
import {
    FlexProofChainError,
    FlexProofEventError,
    FlexProofHashError,
    FlexProofSendSaveError,
    FlexProofAccumulatorPresenceError,
    FlexProofBasePresenceError,
    FlexProofDeadlinePresenceError
} from "./interfaces/FlexSendProofError.sol";

contract FlexSendProofVerifier is IFlexSendProofVerifier {
    bytes32 private constant SEND_SIG = 0x4cea8b710e627c582bfc256cb3c9376be297ee5431867ac173e1f2b08b372613; // keccak256("FlexSend(bytes32)")
    bytes32 private constant SEND_FAIL_SIG = 0xff0a1efb6bc8bbe9de4826e06fdd6ae11433a17120695e65a4f96b4f7fb62563; // keccak256("FlexSendFail(bytes32)")

    address public immutable flexSendSave;

    constructor(address saver_) {
        flexSendSave = saver_;
    }

    function verifyHashEventProof(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external view override {
        require(chain_ == block.chainid, FlexProofChainError());

        FlexSendProofData calldata data;
        assembly { data := proof_.offset }

        if (sig_ == SEND_SIG) return _verifySend(data, hash_);
        if (sig_ == SEND_FAIL_SIG) return _verifySendFail(data, hash_);
        revert FlexProofEventError();
    }

    function _verifySend(FlexSendProofData calldata data_, bytes32 hash_) private view {
        hash_ = _verifyHash(data_, hash_);
        bytes20 accumulator = FlexHashTree.calcAccumulatorPart(data_.orderBranch, hash_);
        _verifySendAccumulator(data_, accumulator);
    }

    function _verifySendFail(FlexSendProofData calldata data_, bytes32 hash_) private view {
        hash_ = _verifyHash(data_, hash_);
        _verifyNotInAccumulator(data_, hash_);
        _verifyNotOutsideTime(data_);
        bytes20 accumulator = _calcSkipAccumulator(data_);
        _verifySendAccumulator(data_, accumulator);
    }

    function _verifyHash(FlexSendProofData calldata data_, bytes32 hash_) private pure returns (bytes32) {
        bytes32 orderHash = FlexHashTree.calcBranchPart(data_.orderBranch, _calcSendHash(data_));
        require(orderHash == hash_, FlexProofHashError());
        return FlexSendAccumulatorData.make(bytes26(orderHash), FlexSendData.readStart(data_.sendData1));
    }

    function _calcSendHash(FlexSendProofData calldata data_) private pure returns (bytes32) {
        return data_.sendData3 == bytes32(0)
            ? FlexEfficientHash.calc(data_.sendData0, data_.sendData1, data_.sendData2)
            : FlexEfficientHash.calc(data_.sendData0, data_.sendData1, data_.sendData2, data_.sendData3);
    }

    function _calcSkipAccumulator(FlexSendProofData calldata data_) private pure returns (bytes20) {
        if (data_.failBaseHash == 0) return FlexHashTree.accumulatorPartBefore(data_.orderBranch); // Skip
        return FlexHashTree.calcAccumulatorPart(data_.orderBranch, data_.failBaseHash);
    }

    function _verifyNotInAccumulator(FlexSendProofData calldata data_, bytes32 hash_) private pure {
        require(data_.failBaseHash != hash_, FlexProofAccumulatorPresenceError());
        require(!FlexHashTree.accumulatorPartIncludes(data_.orderBranch, hash_), FlexProofAccumulatorPresenceError());
    }

    function _verifyNotOutsideTime(FlexSendProofData calldata data_) private pure {
        uint48 start = FlexSendData.readStart(data_.sendData1);
        uint48 baseTime = FlexSendAccumulatorData.readStart(data_.failBaseHash);
        require(start > baseTime, FlexProofBasePresenceError());

        uint48 deadline = start + FlexSendData.readDuration(data_.sendData1);
        require(deadline < data_.saveTime, FlexProofDeadlinePresenceError());
    }

    function _verifySendAccumulator(FlexSendProofData calldata data_, bytes20 accumulator_) private view {
        bytes32 sendSave = _calcSendSave(data_, accumulator_);
        _verifySendSave(sendSave, data_.saveBucket);
    }

    function _calcSendSave(FlexSendProofData calldata data_, bytes20 accumulator_) private pure returns (bytes32) {
        bytes32 bucket = FlexSendStateBucket.calcBucket(FlexSendData.readSender(data_.sendData0), FlexSendData.readGroup(data_.sendData1));
        bytes32 bucketState = FlexSendBucketStateData.make(accumulator_, data_.saveTime);
        return FlexEfficientHash.calc(bucket, bucketState);
    }

    function _verifySendSave(bytes32 sendSave_, bytes32 saveBucket_) private view {
        address saver = address(bytes20(saveBucket_));
        uint96 saverSlot = uint96(uint256(saveBucket_));
        bytes32 knownSendSave = IFlexSendSave(flexSendSave).flexSendSave(saver, saverSlot);
        require(knownSendSave == sendSave_, FlexProofSendSaveError());
    }
}
