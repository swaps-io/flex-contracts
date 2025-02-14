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
        return _calcBranch(branch_, leaf_, 0);
    }

    function calcBranchLimited(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32) {
        return _calcBranch(branch_, leaf_, uint96(uint256(branch_[0])));
    }

    function calcAccumulator(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes20) {
        bytes32 header = branch_[0];
        uint256 end = uint96(uint256(header));
        bytes20 accumulator = FlexHashAccumulator.accumulate(bytes20(header), leaf_);
        for (uint256 cursor = 1; cursor < end; cursor++) {
            accumulator = FlexHashAccumulator.accumulate(accumulator, branch_[cursor]);
        }
        return accumulator;
    }

    function _calcBranch(bytes32[] calldata branch_, bytes32 leaf_, uint256 cursor_) private pure returns (bytes32) {
        for (; cursor_ < branch_.length; cursor_++) {
            leaf_ = Hashes.commutativeKeccak256(leaf_, branch_[cursor_]);
        }
        return leaf_;
    }
}
