// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {Hashes} from "@openzeppelin/contracts/utils/cryptography/Hashes.sol";

import {FlexHashAccumulator} from "./FlexHashAccumulator.sol";

library FlexHashTree {
    // Content:
    // - tree branch (only):
    //   - <length> words: tree branch
    // - tree branch (limited) + accumulator branch:
    //   - first word: <accumulator offset>
    //   - <accumulator offset - 1> words: tree branch
    //   - next word: accumulator hash before
    //   - rest words: accumulator hashes after

    function calcBranch(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32) {
        return _calcBranch(branch_, leaf_, 0, branch_.length);
    }

    function calcBranchLimited(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes32) {
        return _calcBranch(branch_, leaf_, 1, uint256(branch_[0]));
    }

    function calcAccumulator(bytes32[] calldata branch_, bytes32 leaf_) internal pure returns (bytes20) {
        uint256 cursor = uint256(branch_[0]);
        bytes20 accumulator = FlexHashAccumulator.accumulate(branch_[cursor++], leaf_);
        for (; cursor < branch_.length; cursor++)
            accumulator = FlexHashAccumulator.accumulate(accumulator, branch_[cursor]);
        return accumulator;
    }

    function _calcBranch(bytes32[] calldata branch_, bytes32 leaf_, uint256 cursor_, uint256 end_) private pure returns (bytes32) {
        for (; cursor_ < end_; cursor_++)
            leaf_ = Hashes.commutativeKeccak256(leaf_, branch_[cursor_]);
        return leaf_;
    }
}
