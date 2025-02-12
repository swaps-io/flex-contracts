// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveTokenFrom} from "../interfaces/IFlexReceiveTokenFrom.sol";

import {FlexReceive} from "../interfaces/events/FlexReceive.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexReceiveTokenFromFacet is IFlexReceiveTokenFrom {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexReceiveTokenFrom.flexReceiveTokenFrom.selector);

    function flexReceiveTokenFrom(
        bytes32 receiveFromData0_, // Content: signer flags (2), deadline(46), nonce (48), sender (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch_,
        bytes calldata senderSignature_
    ) external override {
        FlexDeadlineConstraint.validate(uint256(receiveFromData0_ << 2) >> 210);

        bytes32 orderHash = FlexEfficientHash.calc(bytes12(receiveFromData0_) | bytes32(uint256(uint160(msg.sender))), receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(uint256(receiveFromData0_)))), orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        address sender = address(uint160(uint256(receiveFromData0_)));
        FlexSignatureConstraint.validate(uint256(receiveFromData0_ >> 254), sender, orderHash, senderSignature_);

        FlexReceiveStateUpdate.toReceived(msg.sender, uint48(uint256(receiveFromData0_) >> 160), orderHash);

        SafeERC20.safeTransferFrom(IERC20(address(uint160(uint256(receiveData2_)))), sender, address(this), uint256(receiveData1_));

        emit FlexReceive(orderHash);
    }
}
