// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import {IFlexReceiveNative} from "../interfaces/IFlexReceiveNative.sol";
import {FlexDeadlineError} from "../interfaces/FlexDeadlineError.sol";
import {FlexSignatureError} from "../interfaces/FlexSignatureError.sol";

import {FlexHashChainStorage} from "../storages/FlexHashChainStorage.sol";

contract FlexReceiveNativeFacet is IFlexReceiveNative {
    bytes32 private immutable _domain;

    constructor(bytes32 domain_) {
        _domain = domain_;
    }

    function flexReceiveNative(
        bytes32 paramBundle_, // Content: deadline (48), nonce (32), group (16), receiver (160)
        bytes32[] calldata componentBranch_,
        bytes calldata receiverSignature_
    ) external payable override {
        {
            uint256 deadline = uint256(paramBundle_ >> 208);
            require(block.timestamp <= deadline, FlexDeadlineError());
        }

        bytes32 orderHash;
        {
            bytes32 componentHash = keccak256(abi.encode(_domain, paramBundle_, msg.value));
            orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);
        }

        {
            address receiver = address(uint160(uint256(paramBundle_)));
            require(SignatureChecker.isValidERC1271SignatureNow(receiver, orderHash, receiverSignature_), FlexSignatureError());
        }

        {
            bytes32 bucket = paramBundle_ & 0x00000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
            FlexHashChainStorage.data()[bucket] = keccak256(abi.encode(FlexHashChainStorage.data()[bucket], orderHash));
        }

        emit FlexReceiveNative(orderHash);
    }
}
