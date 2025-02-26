// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendSave} from "../../interfaces/views/IFlexSendSave.sol";

import {FlexHashTree} from "../../libraries/utilities/FlexHashTree.sol";
import {FlexEfficientHash} from "../../libraries/utilities/FlexEfficientHash.sol";

import {FlexSendBucketStateData} from "../../libraries/data/FlexSendBucketStateData.sol";
import {FlexSendData} from "../../libraries/data/FlexSendData.sol";

import {FlexSendStateBucket} from "../../libraries/storages/FlexSendStateBucket.sol";

import {IFlexSendProofVerifier} from "./interfaces/IFlexSendProofVerifier.sol";
import {FlexSendProofData} from "./interfaces/FlexSendProofData.sol";
import {FLEX_SEND_EVENT_SIGNATURE, FLEX_NO_SEND_EVENT_SIGNATURE} from "./interfaces/FlexSendProofEventSignatures.sol";
import {FlexProofChainError, FlexProofEventError, FlexProofHashError, FlexProofSendSaveError, FlexProofPresentedError} from "./interfaces/FlexSendProofErrors.sol";

contract FlexSendProofVerifier is IFlexSendProofVerifier {
    address public immutable flexSendSave;

    constructor(address saver_) {
        flexSendSave = saver_;
    }

    function verifyHashEventProof(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external view override {
        _verifyChain(chain_);
        bool presented = _verifyEvent(sig_);
        FlexSendProofData calldata data = _parseData(proof_);
        _verifyHash(data, hash_);
        if (presented) {
            bytes20 accumulator = _calcAccumulator(data, hash_);
            bytes32 sendSave = _calcSendSave(data, accumulator);
            _verifySendSave(sendSave, data.saveBucket);
        } else {
            _verifyNotPresented(data, hash_);
            revert(); // TODO
            // _verifyDeadlineExceeded(...);
            // bytes20 accumulator = _calcAccumulator(data, hash_);
            // _verifySendSave(sendSave, data.saveBucket);
        }
    }

    function _verifyChain(uint256 chain_) private view {
        require(chain_ == block.chainid, FlexProofChainError());
    }

    function _verifyEvent(bytes32 sig_) private pure returns (bool presented) {
        presented = sig_ == FLEX_SEND_EVENT_SIGNATURE;
        require(presented || sig_ == FLEX_NO_SEND_EVENT_SIGNATURE, FlexProofEventError());
    }

    function _parseData(bytes calldata proof_) private pure returns (FlexSendProofData calldata data) {
        assembly { data := add(proof_.offset, 64) } // prettier-ignore
    }

    function _verifyHash(FlexSendProofData calldata data_, bytes32 hash_) private pure {
        bytes32 orderHash = data_.sendData3 == bytes32(0)
            ? FlexEfficientHash.calc(data_.sendData0, data_.sendData1, data_.sendData2)
            : FlexEfficientHash.calc(data_.sendData0, data_.sendData1, data_.sendData2, data_.sendData3);
        orderHash = FlexHashTree.calcBranchPart(data_.orderBranch, orderHash);
        require(orderHash == hash_, FlexProofHashError());
    }

    function _calcAccumulator(FlexSendProofData calldata data_, bytes32 hash_) private pure returns (bytes20) {
        return FlexHashTree.calcAccumulatorPart(data_.orderBranch, hash_);
    }

    function _verifyNotPresented(FlexSendProofData calldata data_, bytes32 hash_) private pure {
        require(!FlexHashTree.checkAccumulatorPartIncludes(data_.orderBranch, hash_), FlexProofPresentedError());
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
