// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundTokenFacet} from "../../facets/FlexRefundTokenFacet.sol";

import {IFlexReceiveToken} from "../../interfaces/IFlexReceiveToken.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundTokenShard is FlexRefundTokenFacet {
    constructor()
        FlexRefundTokenFacet(
            FlexStandaloneDomain.calc(FlexRefundTokenFacet.flexRefundToken.selector),
            FlexStandaloneDomain.calc(IFlexReceiveToken.flexReceiveToken.selector)
        )
    {}
}
