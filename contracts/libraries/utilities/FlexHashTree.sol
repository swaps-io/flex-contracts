// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {Hashes} from "@openzeppelin/contracts/utils/cryptography/Hashes.sol";

import {FlexHashAccumulator} from "./FlexHashAccumulator.sol";

library FlexHashTree {
    // Content:
    // - tree branch (only):
    //   - <length> words: tree branch
    // - accumulator branch + tree branch (limited):
    //   - first word: accumulator hash before (160), branch offset (96)
    //   - words before <branch offset>: accumulator hashes after
    //   - rest words: tree branch

    function calcBranch(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32) {
        return calcBranchSlice(branch_, leaf_, 0, branch_.length);
    }

    function calcAccumulatorBranch(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32 branchHash, bytes20 accumulator) {
        uint256 offset; (accumulator, offset) = readAccumulatorHeader(branch_);
        branchHash = calcBranchSlice(branch_, leaf_, offset, branch_.length);
        accumulator = FlexHashAccumulator.accumulate(accumulator, branchHash);
        accumulator = calcAccumulatorSlice(branch_, accumulator, 1, offset);
    }

    function readAccumulatorHeader(bytes32[] calldata branch_) internal pure returns (bytes20 hashBefore, uint96 branchOffset) {
        bytes32 header = branch_[0];
        hashBefore = bytes20(header);
        branchOffset = uint96(uint256(header));
    }

    function calcBranchSlice(bytes32[] calldata branch_, bytes32 leaf_, uint256 cursor_, uint256 end_) internal pure returns (bytes32) {
        for (; cursor_ < end_; cursor_++)
            leaf_ = Hashes.commutativeKeccak256(leaf_, branch_[cursor_]);
        return leaf_;
    }

    function calcAccumulatorSlice(bytes32[] calldata branch_, bytes20 hash_, uint256 cursor_, uint256 end_) internal pure returns (bytes20) {
        for (; cursor_ < end_; cursor_++)
            hash_ = FlexHashAccumulator.accumulate(hash_, branch_[cursor_]);
        return hash_;
    }
}
