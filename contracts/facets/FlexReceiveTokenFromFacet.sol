// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveTokenFrom} from "../interfaces/IFlexReceiveTokenFrom.sol";

import {FlexCallerError} from "../interfaces/errors/FlexCallerError.sol";
import {FlexDeadlineError} from "../interfaces/errors/FlexDeadlineError.sol";
import {FlexSignatureError} from "../interfaces/errors/FlexSignatureError.sol";
import {FlexStateError} from "../interfaces/errors/FlexStateError.sol";

import {FlexReceive} from "../interfaces/events/FlexReceive.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess, FlexReceiveState} from "../storages/FlexReceiveStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexReceiveTokenFromFacet is IFlexReceiveTokenFrom {
    bytes32 private immutable _domain;

    constructor(bytes32 domain_) {
        _domain = domain_;
    }

    function flexReceiveTokenFrom(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 receiveData3_, // Content: <unused> (96), sender (160)
        bytes32[] calldata componentBranch_,
        bytes calldata senderSignature_
    ) external override {
        address receiver = address(uint160(uint256(receiveData0_)));
        // require(msg.sender == receiver, FlexCallerError()); // TODO - check if there is a need, if so - consider adding extra field

        uint48 deadline = uint48(uint256(receiveData0_) >> 208);
        require(block.timestamp <= deadline, FlexDeadlineError());

        bytes32 componentHash = keccak256(abi.encode(_domain, receiveData0_, receiveData1_, receiveData2_, receiveData3_));
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address sender = address(uint160(uint256(receiveData3_)));
        require(ECDSA.recover(MessageHashUtils.toEthSignedMessageHash(orderHash), senderSignature_) == sender, FlexSignatureError());

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
        SafeERC20.safeTransferFrom(IERC20(token), sender, address(this), uint256(receiveData1_));

        emit FlexReceive(orderHash);
    }
}
