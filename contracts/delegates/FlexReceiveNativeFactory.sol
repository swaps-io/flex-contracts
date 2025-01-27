// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import {IFlexReceiveNativeFactory} from "./interfaces/IFlexReceiveNativeFactory.sol";
import {IFlexReceiveNativeBox} from "./interfaces/IFlexReceiveNativeBox.sol";
import {FlexKeyError} from "./interfaces/FlexKeyError.sol";

contract FlexReceiveNativeFactory is IFlexReceiveNativeFactory {
    address public immutable override flexBoxProto;
    bytes32 public immutable override flexConfirmNativeDomain;
    bytes32 public immutable override flexRefundNativeDomain;

    constructor(
        address boxProto_,
        bytes32 confirmNativeDomain_,
        bytes32 refundNativeDomain_
    ) {
        flexBoxProto = boxProto_;
        flexConfirmNativeDomain = confirmNativeDomain_;
        flexRefundNativeDomain = refundNativeDomain_;
    }

    function flexPredictNativeBox(bytes32 orderHash_) external view override returns (address) {
        return Clones.predictDeterministicAddress(flexBoxProto, orderHash_, address(this));
    }

    function flexConfirmNative(
        bytes32 paramBundle0_, // Content: <unused> (96), confirm receiver (160)
        bytes32 paramBundle1_, // Content: confirm key hash (256)
        bytes32 paramBundle2_, // Content: confirm key (256)
        bytes32[] calldata confirmBranch_
    ) external override {
        require(paramBundle1_ == keccak256(abi.encode(paramBundle2_)), FlexKeyError());

        bytes32 orderHash;
        {
            bytes32 confirmHash = keccak256(abi.encode(flexConfirmNativeDomain, paramBundle0_, paramBundle1_));
            orderHash = MerkleProof.processProofCalldata(confirmBranch_, confirmHash);
        }

        {
            address deployed = Clones.cloneDeterministic(flexBoxProto, orderHash);
            address receiver = address(uint160(uint256(paramBundle0_)));
            IFlexReceiveNativeBox(deployed).takeNative(receiver);
        }

        emit FlexConfirmNative(orderHash);
    }

    function flexRefundNative(
        bytes32 paramBundle0_, // Content: <unused> (96), refund receiver (160)
        bytes32 paramBundle1_, // Content: refund key hash (256)
        bytes32 paramBundle2_, // Content: refund key (256)
        bytes32[] calldata refundBranch_
    ) external {
        require(paramBundle1_ == keccak256(abi.encode(paramBundle2_)), FlexKeyError());

        bytes32 orderHash;
        {
            bytes32 refundHash = keccak256(abi.encode(flexRefundNativeDomain, paramBundle0_, paramBundle1_));
            orderHash = MerkleProof.processProofCalldata(refundBranch_, refundHash);
        }

        {
            address deployed = Clones.cloneDeterministic(flexBoxProto, orderHash);
            address receiver = address(uint160(uint256(paramBundle0_)));
            IFlexReceiveNativeBox(deployed).takeNative(receiver);
        }

        emit FlexRefundNative(orderHash);
    }
}
