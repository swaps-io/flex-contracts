// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmNativeProofFacet} from "../../facets/FlexConfirmNativeProofFacet.sol";

import {IFlexReceiveNative} from "../../interfaces/IFlexReceiveNative.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmNativeProofShard is FlexConfirmNativeProofFacet {
    constructor(address proofVerifier_)
        FlexConfirmNativeProofFacet(
            FlexStandaloneDomain.calc(FlexConfirmNativeProofFacet.flexConfirmNativeProof.selector),
            FlexStandaloneDomain.calc(IFlexReceiveNative.flexReceiveNative.selector),
            proofVerifier_
        )
    {}
}
