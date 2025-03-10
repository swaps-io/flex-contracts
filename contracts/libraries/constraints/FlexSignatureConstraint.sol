// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {SignatureChecker, ECDSA} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {FlexSignatureError} from "../../interfaces/errors/FlexSignatureError.sol";

library FlexSignatureConstraint {
    function validate(uint256 flags_, address signer_, bytes32 hash_, bytes calldata signature_) internal view {
        if (flags_ & 1 == 0) { // Flag #0 - validate as contract signature
            if (flags_ & 2 == 0) hash_ = MessageHashUtils.toEthSignedMessageHash(hash_); // Flag #1 - no message signature wrap
            (address recovered, ECDSA.RecoverError err,) = ECDSA.tryRecover(hash_, signature_);
            if (err == ECDSA.RecoverError.NoError && recovered == signer_) return; // Valid EOA signature
            require(flags_ & 4 == 0, FlexSignatureError()); // Flag #2 - no validation retry as contract signature
        }
        require(SignatureChecker.isValidERC1271SignatureNow(signer_, hash_, signature_), FlexSignatureError());
    }
}
