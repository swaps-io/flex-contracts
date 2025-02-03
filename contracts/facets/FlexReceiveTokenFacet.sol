// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveToken} from "../interfaces/IFlexReceiveToken.sol";

import {FlexDeadlineError} from "../interfaces/errors/FlexDeadlineError.sol";
import {FlexSignatureError} from "../interfaces/errors/FlexSignatureError.sol";
import {FlexStateError} from "../interfaces/errors/FlexStateError.sol";

import {FlexReceive} from "../interfaces/events/FlexReceive.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess, FlexReceiveState} from "../storages/FlexReceiveStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexReceiveTokenFacet is IFlexReceiveToken {
    bytes32 private immutable _domain;

    constructor(bytes32 domain_) {
        _domain = domain_;
    }

    function flexReceiveToken(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch_,
        bytes calldata receiverSignature_
    ) external override {
        uint48 deadline = uint48(uint256(receiveData0_) >> 208);
        require(block.timestamp <= deadline, FlexDeadlineError());

        bytes32 componentHash = keccak256(abi.encode(_domain, receiveData0_, receiveData1_, receiveData2_));
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        require(SignatureChecker.isValidERC1271SignatureNow(receiver, orderHash, receiverSignature_), FlexSignatureError());

        uint96 nonce = uint48(uint256(receiveData0_) >> 160);
        bytes32 bucket = FlexReceiveStateAccess.calcBucket(receiver, nonce);
        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];

        uint8 offset = FlexReceiveStateAccess.calcOffset(nonce);
        require(FlexReceiveStateAccess.readState(bucketState, offset) == FlexReceiveState.None, FlexStateError());
        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Received);

        bytes20 receiveHash = FlexReceiveStateAccess.readHash(bucketState);
        receiveHash = FlexHashAccumulator.accumulate(receiveHash, orderHash);
        bucketState = FlexReceiveStateAccess.writeHash(bucketState, receiveHash);

        FlexReceiveStateStorage.data()[bucket] = bucketState;

        address token = address(uint160(uint256(receiveData2_)));
        SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), uint256(receiveData1_));

        emit FlexReceive(orderHash);
    }
}
