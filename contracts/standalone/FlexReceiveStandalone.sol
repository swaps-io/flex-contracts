// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeFacet} from "../facets/FlexReceiveNativeFacet.sol";
import {FlexReceiveNativeDomainFacet} from "../facets/FlexReceiveNativeDomainFacet.sol";
import {FlexReceiveStateFacet} from "../facets/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../facets/FlexReceiveHashFacet.sol";
import {FlexConfirmNativeFacet} from "../facets/FlexConfirmNativeFacet.sol";
import {FlexConfirmNativeDomainFacet} from "../facets/FlexConfirmNativeDomainFacet.sol";

contract FlexReceiveStandalone is FlexReceiveNativeFacet, FlexReceiveNativeDomainFacet, FlexReceiveStateFacet, FlexReceiveHashFacet, FlexConfirmNativeFacet, FlexConfirmNativeDomainFacet {
    constructor(bytes32 receiveNativeDomain_, bytes32 confirmNativeDomain_)
        FlexReceiveNativeFacet(receiveNativeDomain_)
        FlexReceiveNativeDomainFacet(receiveNativeDomain_)
        FlexConfirmNativeFacet(confirmNativeDomain_, receiveNativeDomain_)
        FlexConfirmNativeDomainFacet(confirmNativeDomain_)
    {}
}
