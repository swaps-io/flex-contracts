// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmTokenProofFacet} from "../../facets/FlexConfirmTokenProofFacet.sol";

import {IFlexReceiveToken} from "../../interfaces/IFlexReceiveToken.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmTokenProofShard is FlexConfirmTokenProofFacet {
    constructor(address proofVerifier_)
        FlexConfirmTokenProofFacet(
            FlexStandaloneDomain.calc(FlexConfirmTokenProofFacet.flexConfirmTokenProof.selector),
            FlexStandaloneDomain.calc(IFlexReceiveToken.flexReceiveToken.selector),
            proofVerifier_
        )
    {}
}
