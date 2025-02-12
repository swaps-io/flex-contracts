// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexRefundNative} from "../interfaces/IFlexRefundNative.sol";

import {FlexRefund} from "../interfaces/events/FlexRefund.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexRefundNativeFacet is IFlexRefundNative {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexRefundNative.flexRefundNative.selector);

    function flexRefundNative(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 refundData0_, // Content: key hash (256)
        bytes32 refundData1_, // Content: <unused> (96), refund receiver (160)
        bytes32 refundKey_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(refundData0_, refundKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint192(uint256(refundData0_)))), refundData1_, orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        FlexReceiveStateUpdate.toRefunded(address(uint160(uint256(receiveData0_))), uint48(uint256(receiveData0_) >> 160), orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(address(uint160(uint256(refundData1_)))), uint256(receiveData1_));

        emit FlexRefund(orderHash);
    }
}
