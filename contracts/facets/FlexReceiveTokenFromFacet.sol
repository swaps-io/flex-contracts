// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveTokenFrom} from "../interfaces/IFlexReceiveTokenFrom.sol";

import {FlexReceive} from "../interfaces/events/FlexReceive.sol";

import {FlexCallerConstraint} from "../libraries/constraints/FlexCallerConstraint.sol";
import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexReceiveTokenFromFacet is IFlexReceiveTokenFrom {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexReceiveTokenFrom.flexReceiveTokenFrom.selector);

    function flexReceiveTokenFrom(
        bytes32 receiveData0_, // Content: deadline (48), nonce (40), <unused> (8), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 receiveData3_, // Content: <unused> (88), sender flags (8), sender (160)
        bytes32[] calldata componentBranch_,
        bytes calldata senderSignature_
    ) external override {
        address receiver = address(uint160(uint256(receiveData0_)));
        FlexCallerConstraint.validate(receiver);

        FlexDeadlineConstraint.validate(uint256(receiveData0_) >> 208);

        bytes32 componentHash = FlexEfficientHash.calc(_domain, receiveData0_, receiveData1_, receiveData2_, receiveData3_);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address sender = address(uint160(uint256(receiveData3_)));
        FlexSignatureConstraint.validate(uint256(receiveData3_ >> 160), sender, orderHash, senderSignature_);

        uint96 nonce = uint40(uint256(receiveData0_) >> 168);
        FlexReceiveStateUpdate.toReceived(receiver, nonce, orderHash);

        address token = address(uint160(uint256(receiveData2_)));
        SafeERC20.safeTransferFrom(IERC20(token), sender, address(this), uint256(receiveData1_));

        emit FlexReceive(orderHash);
    }
}
