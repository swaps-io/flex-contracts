// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendTokenFacet} from "../../facets/FlexSendTokenFacet.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexSendTokenShard is FlexSendTokenFacet {
    constructor()
        FlexSendTokenFacet(
            FlexStandaloneDomain.calc(FlexSendTokenFacet.flexSendToken.selector)
        )
    {}
}
