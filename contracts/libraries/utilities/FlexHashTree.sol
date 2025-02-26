// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {Hashes} from "@openzeppelin/contracts/utils/cryptography/Hashes.sol";

import {FlexHashAccumulator} from "./FlexHashAccumulator.sol";

library FlexHashTree {
    // Content:
    // - tree branch (only):
    //   - <length> words: tree branch
    // - accumulator branch + tree branch (parts):
    //   - first word (header): accumulator hash before (160), branch offset (96)
    //   - words before <branch offset>: accumulator hashes after
    //   - rest words: tree branch

    function calcBranch(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32 branchHash) {
        branchHash = _calcBranch(branch_, leaf_, 0); // Branch only, no header
    }

    function calcAccumulatorBranch(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32 branchHash, bytes20 accumulator) {
        uint256 offset; (accumulator, offset) = _readHeader(branch_);
        branchHash = _calcBranch(branch_, leaf_, offset);
        accumulator = _calcAccumulator(branch_, accumulator, branchHash, offset);
    }

    function calcAccumulatorPart(bytes32[] calldata branch_, bytes32 hash_) internal pure returns (bytes20 accumulator) {
        uint256 offset; (accumulator, offset) = _readHeader(branch_);
        accumulator = _calcAccumulator(branch_, accumulator, hash_, offset);
    }

    function calcBranchPart(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32 branchHash) {
        (, uint256 offset) = _readHeader(branch_);
        branchHash = _calcBranch(branch_, leaf_, offset);
    }

    function _readHeader(bytes32[] calldata branch_) private pure returns (bytes20 hashBefore, uint96 branchOffset) {
        bytes32 header = branch_[0];
        hashBefore = bytes20(header);
        branchOffset = uint96(uint256(header));
    }

    function _calcBranch(bytes32[] calldata branch_, bytes32 leaf_, uint256 cursor_) private pure returns (bytes32) {
        for (; cursor_ < branch_.length; cursor_++)
            leaf_ = Hashes.commutativeKeccak256(leaf_, branch_[cursor_]);
        return leaf_;
    }

    function _calcAccumulator(bytes32[] calldata branch_, bytes20 accumulator_, bytes32 hash_, uint256 end_) private pure returns (bytes20) {
        accumulator_ = FlexHashAccumulator.accumulate(accumulator_, hash_);
        for (uint256 cursor = 1; cursor < end_; cursor++)
            accumulator_ = FlexHashAccumulator.accumulate(accumulator_, branch_[cursor]);
        return accumulator_;
    }
}
