// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSettleToken} from "../interfaces/IFlexSettleToken.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexSettleTokenFacet is IFlexSettleToken {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexSettleToken.flexSettleToken.selector);

    function flexSettleToken(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 settleData0_, // Content: <unused> (95), settle flags (1), settle receiver (160)
        bytes32 settleData1_, // Content: key hash (256)
        bytes32 settleKey_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(settleData1_, settleKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint192(uint256(settleData0_)))), settleData1_, orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        FlexReceiveStateUpdate.toSettled(receiveData0_, settleData0_, orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        SafeERC20.safeTransfer(IERC20(address(uint160(uint256(receiveData2_)))), address(uint160(uint256(receiveData0_))), uint256(receiveData1_));
    }
}
