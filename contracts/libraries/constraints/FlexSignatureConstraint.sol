// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {SignatureChecker, ECDSA} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {FlexSignatureError} from "../../interfaces/errors/FlexSignatureError.sol";

library FlexSignatureConstraint {
    function validate(bool contract_, address signer_, bytes32 hash_, bytes calldata signature_) internal view {
        if (contract_) {
            require(SignatureChecker.isValidERC1271SignatureNow(signer_, hash_, signature_), FlexSignatureError());
        } else {
            (address recovered, ECDSA.RecoverError err,) = ECDSA.tryRecover(MessageHashUtils.toEthSignedMessageHash(hash_), signature_);
            require(err == ECDSA.RecoverError.NoError && recovered == signer_, FlexSignatureError());
        }
    }
}
