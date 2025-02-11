// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmTokenFacet} from "../../facets/FlexConfirmTokenFacet.sol";

import {IFlexReceiveToken} from "../../interfaces/IFlexReceiveToken.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmTokenShard is FlexConfirmTokenFacet {
    constructor()
        FlexConfirmTokenFacet(
            FlexStandaloneDomain.calc(FlexConfirmTokenFacet.flexConfirmToken.selector),
            FlexStandaloneDomain.calc(IFlexReceiveToken.flexReceiveToken.selector)
        )
    {}
}
