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
        return _calcBranchAt(branch_, leaf_, 0);
    }

    function calcAccumulatorBranch(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32 branchHash, bytes20 accumulator) {
        bytes32 header = branch_[0];
        uint256 offset = uint96(uint256(header));
        branchHash = _calcBranchAt(branch_, leaf_, offset);
        accumulator = FlexHashAccumulator.accumulate(bytes20(header), branchHash);
        for (uint256 cursor = 1; cursor < offset; cursor++) {
            accumulator = FlexHashAccumulator.accumulate(accumulator, branch_[cursor]);
        }
    }

    function _calcBranchAt(bytes32[] calldata branch_, bytes32 leaf_, uint256 cursor_) private pure returns (bytes32) {
        for (; cursor_ < branch_.length; cursor_++) {
            leaf_ = Hashes.commutativeKeccak256(leaf_, branch_[cursor_]);
        }
        return leaf_;
    }
}
