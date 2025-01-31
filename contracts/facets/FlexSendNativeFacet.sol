// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSendNative} from "../interfaces/IFlexSendNative.sol";
import {FlexCallerError} from "../interfaces/FlexCallerError.sol";
import {FlexEarlinessError} from "../interfaces/FlexEarlinessError.sol";
import {FlexDeadlineError} from "../interfaces/FlexDeadlineError.sol";
import {FlexChronologyError} from "../interfaces/FlexChronologyError.sol";

import {FlexSendStateStorage} from "../storages/FlexSendStateStorage.sol";
import {FlexSendStateAccess} from "../storages/FlexSendStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexSendNativeFacet is IFlexSendNative {
    bytes32 private immutable _domain;

    constructor(bytes32 domain_) {
        _domain = domain_;
    }

    function flexSendNative(
        bytes32 sendData0_, // Content: send start (48), time to send (48), sender (160)
        bytes32 sendData1_, // Content: sender group (48), nonce (48), receiver (160)
        bytes32[] calldata componentBranch_
    ) external payable override {
        address sender = address(uint160(uint256(sendData0_)));
        require(msg.sender == sender, FlexCallerError());

        uint48 start = uint48(uint256(sendData0_) >> 208);
        require(block.timestamp >= start, FlexEarlinessError());

        uint48 deadline = start + uint48(uint256(sendData0_) >> 160);
        require(block.timestamp <= deadline, FlexDeadlineError());

        bytes32 componentHash = keccak256(abi.encode(_domain, sendData0_, sendData1_, msg.value));
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        uint48 group = uint48(uint256(sendData0_) >> 208);
        bytes32 bucket = FlexSendStateAccess.calcBucket(sender, group);
        bytes32 bucketState = FlexSendStateStorage.data()[bucket];
        require(FlexSendStateAccess.readTime(bucketState) <= start, FlexChronologyError());
        bucketState = FlexSendStateAccess.writeTime(bucketState, start);

        bytes20 sendHash = FlexSendStateAccess.readHash(bucketState);
        sendHash = FlexHashAccumulator.accumulate(sendHash, orderHash);
        bucketState = FlexSendStateAccess.writeHash(bucketState, sendHash);

        FlexSendStateStorage.data()[bucket] = bucketState;

        address receiver = address(uint160(uint256(sendData1_)));
        Address.sendValue(payable(receiver), msg.value);

        emit FlexSendNative(orderHash);
    }
}
