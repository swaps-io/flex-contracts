// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSettleTokenProof} from "../interfaces/IFlexSettleTokenProof.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexSettleProofData} from "../libraries/data/FlexSettleProofData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexSettleTokenProofFacet is IFlexSettleTokenProof {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSettleTokenProof.flexSettleTokenProof.selector);
    address private immutable _proofVerifier;

    constructor(address proofVerifier_) {
        _proofVerifier = proofVerifier_;
    }

    function flexSettleTokenProof(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 receiveData2_,
        bytes32 settleData0_,
        bytes32 settleData1_,
        bytes calldata settleProof_,
        bytes32[] calldata orderBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(FlexSettleProofData.writeDomain(settleData0_, _domain), settleData1_, FlexSettleProofData.make2(orderHash));
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexProofConstraint.verify(_proofVerifier, FlexSettleProofData.readEventSignature(settleData1_), orderHash, FlexSettleProofData.readEventChain(settleData0_), settleProof_);

        FlexReceiveStateUpdate.toSettled(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, receiveHashBefore_, receiveOrderHashesAfter_, FlexSettleProofData.readConfirm(settleData0_));

        SafeERC20.safeTransfer(IERC20(FlexReceiveData.readToken(receiveData2_)), FlexSettleProofData.readReceiver(settleData0_), FlexReceiveData.readAmount(receiveData1_));
    }
}
