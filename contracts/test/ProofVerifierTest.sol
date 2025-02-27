// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IProofVerifier} from "../externals/proofs/interfaces/IProofVerifier.sol";

contract ProofVerifierTest is IProofVerifier {
    error InvalidTestProof();

    bytes32 public allowedHashEventProof;

    function verifyHashEventProof(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external view override {
        bytes32 paramHash = _hashProofParams(sig_, hash_, chain_, proof_);
        require(paramHash == allowedHashEventProof, InvalidTestProof());
    }

    function allowHashEventProof(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external {
        allowedHashEventProof = _hashProofParams(sig_, hash_, chain_, proof_);
    }

    function _hashProofParams(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) private pure returns (bytes32) {
        return keccak256(abi.encode(sig_, hash_, chain_, keccak256(proof_)));
    }
}
