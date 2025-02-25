// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendSave} from "../../interfaces/views/IFlexSendSave.sol";

import {FlexHashTree} from "../../libraries/utilities/FlexHashTree.sol";
import {FlexEfficientHash} from "../../libraries/utilities/FlexEfficientHash.sol";

import {FlexSendBucketStateData} from "../../libraries/data/FlexSendBucketStateData.sol";

import {IFlexSendProofVerifier} from "./interfaces/IFlexSendProofVerifier.sol";
import {FlexSendProofData} from "./interfaces/FlexSendProofData.sol";
import {FLEX_SEND_EVENT_SIGNATURE, FLEX_NO_SEND_EVENT_SIGNATURE} from "./interfaces/FlexSendProofEventSignatures.sol";
import {FlexProofChainError, FlexProofEventError, FlexProofHashError, FlexProofAccumulatorError, FlexProofSendSaveError} from "./interfaces/FlexSendProofErrors.sol";

contract FlexSendProofVerifier is IFlexSendProofVerifier {
    address public immutable flexSendSave;

    constructor(address saver_) {
        flexSendSave = saver_;
    }

    function verifyHashEventProof(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external view override {
        // // // // // // // // // // // // // // // // // // // // // // // // // //
        require(sig_ == FLEX_SEND_EVENT_SIGNATURE, "TODO: no-send event proofing");
        // // // // // // // // // // // // // // // // // // // // // // // // // //

        require(chain_ == block.chainid, FlexProofChainError());
        require(sig_ == FLEX_SEND_EVENT_SIGNATURE || sig_ == FLEX_NO_SEND_EVENT_SIGNATURE, FlexProofEventError());

        FlexSendProofData calldata data;
        assembly { data := add(proof_.offset, 64) } // prettier-ignore

        bytes32 orderHash = data.sendData3 == bytes32(0)
            ? FlexEfficientHash.calc(data.sendData0, data.sendData1, data.sendData2)
            : FlexEfficientHash.calc(data.sendData0, data.sendData1, data.sendData2, data.sendData3);
        bytes20 accumulator; (orderHash, accumulator) = FlexHashTree.calcAccumulatorBranch(data.orderBranch, orderHash);
        require(orderHash == hash_, FlexProofHashError());
        require(accumulator == FlexSendBucketStateData.readHash(data.bucketState), FlexProofAccumulatorError());

        bytes32 sendSave = FlexEfficientHash.calc(data.bucket, data.bucketState);
        address saver = address(bytes20(data.saveBucket));
        uint96 saverSlot = uint96(uint256(data.saveBucket));
        require(sendSave == IFlexSendSave(flexSendSave).flexSendSave(saver, saverSlot), FlexProofSendSaveError());
    }
}
