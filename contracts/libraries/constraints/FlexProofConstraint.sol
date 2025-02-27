// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IProofVerifier} from "../../externals/proofs/interfaces/IProofVerifier.sol";

library FlexProofConstraint {
    function verify(address proofVerifier_, bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) internal {
        IProofVerifier(proofVerifier_).verifyHashEventProof(sig_, hash_, chain_, proof_);
    }
}
