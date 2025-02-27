// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexProofVerifier} from "../../interfaces/views/IFlexProofVerifier.sol";

contract FlexProofVerifierFacet is IFlexProofVerifier {
    address public immutable override flexProofVerifier;

    constructor(address proofVerifier_) {
        flexProofVerifier = proofVerifier_;
    }
}
