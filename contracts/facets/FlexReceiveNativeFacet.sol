// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import {IFlexReceiveNative} from "../interfaces/IFlexReceiveNative.sol";
import {FlexDeadlineError} from "../interfaces/FlexDeadlineError.sol";
import {FlexSignatureError} from "../interfaces/FlexSignatureError.sol";
import {FlexStateError} from "../interfaces/FlexStateError.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess, FlexReceiveState} from "../storages/FlexReceiveStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexReceiveNativeFacet is IFlexReceiveNative {
    bytes32 private immutable _domain;

    constructor(bytes32 domain_) {
        _domain = domain_;
    }

    function flexReceiveNative(
        bytes32 paramBundle_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32[] calldata componentBranch_,
        bytes calldata receiverSignature_
    ) external payable override {
        uint48 deadline = uint48(uint256(paramBundle_) >> 208);
        require(block.timestamp <= deadline, FlexDeadlineError());

        bytes32 componentHash = keccak256(abi.encode(_domain, paramBundle_, msg.value));
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address receiver = address(uint160(uint256(paramBundle_)));
        require(SignatureChecker.isValidERC1271SignatureNow(receiver, orderHash, receiverSignature_), FlexSignatureError());

        uint96 nonce = uint48(uint256(paramBundle_) >> 160);
        bytes32 bucket = FlexReceiveStateAccess.calcBucket(receiver, nonce);
        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];

        uint8 offset = FlexReceiveStateAccess.calcOffset(nonce);
        require(FlexReceiveStateAccess.readState(bucketState, offset) == FlexReceiveState.None, FlexStateError());
        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Received);

        bytes20 receiveHash = FlexReceiveStateAccess.readHash(bucketState);
        receiveHash = FlexHashAccumulator.accumulate(receiveHash, orderHash);
        bucketState = FlexReceiveStateAccess.writeHash(bucketState, receiveHash);

        FlexReceiveStateStorage.data()[bucket] = bucketState;

        emit FlexReceiveNative(orderHash);
    }
}
