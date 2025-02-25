// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IProofVerifier} from "../../../externals/proofs/interfaces/IProofVerifier.sol";

interface IFlexSendProofVerifier is IProofVerifier {
    function flexSendSave() external view returns (address);
}
