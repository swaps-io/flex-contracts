// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveToken} from "../interfaces/IFlexReceiveToken.sol";

import {FlexReceive} from "../interfaces/events/FlexReceive.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexReceiveTokenFacet is IFlexReceiveToken {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexReceiveToken.flexReceiveToken.selector);

    function flexReceiveToken(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch_,
        bytes calldata receiverSignature_
    ) external override {
        FlexDeadlineConstraint.validate(uint256(receiveData0_ << 2) >> 210);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(msg.sender))), orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        FlexSignatureConstraint.validate(uint256(receiveData0_ >> 254), receiver, orderHash, receiverSignature_);

        FlexReceiveStateUpdate.toReceived(receiver, uint48(uint256(receiveData0_) >> 160), orderHash);

        SafeERC20.safeTransferFrom(IERC20(address(uint160(uint256(receiveData2_)))), msg.sender, address(this), uint256(receiveData1_));

        emit FlexReceive(orderHash);
    }
}
