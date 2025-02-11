// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundNativeProofFacet} from "../../facets/FlexRefundNativeProofFacet.sol";

import {IFlexReceiveNative} from "../../interfaces/IFlexReceiveNative.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundNativeProofShard is FlexRefundNativeProofFacet {
    constructor(address proofVerifier_)
        FlexRefundNativeProofFacet(
            FlexStandaloneDomain.calc(FlexRefundNativeProofFacet.flexRefundNativeProof.selector),
            FlexStandaloneDomain.calc(IFlexReceiveNative.flexReceiveNative.selector),
            proofVerifier_
        )
    {}
}
