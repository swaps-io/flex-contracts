// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSettleToken} from "../interfaces/IFlexSettleToken.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexSettleData} from "../libraries/data/FlexSettleData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexSettleTokenFacet is IFlexSettleToken {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSettleToken.flexSettleToken.selector);

    function flexSettleToken(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 receiveData2_,
        bytes32 settleData0_,
        bytes32 settleData1_,
        bytes32 settleKey_,
        bytes32[] calldata orderBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(FlexSettleData.readKeyHash(settleData1_), settleKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(FlexSettleData.writeDomain(settleData0_, _domain), settleData1_, FlexSettleData.make2(orderHash));
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexReceiveStateUpdate.toSettled(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, receiveHashBefore_, receiveOrderHashesAfter_, FlexSettleData.readConfirm(settleData0_));

        SafeERC20.safeTransfer(IERC20(FlexReceiveData.readToken(receiveData2_)), FlexSettleData.readReceiver(settleData0_), FlexReceiveData.readAmount(receiveData1_));
    }
}
