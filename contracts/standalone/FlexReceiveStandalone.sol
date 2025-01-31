// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeFacet} from "../facets/FlexReceiveNativeFacet.sol";
import {FlexReceiveNativeDomainFacet} from "../facets/FlexReceiveNativeDomainFacet.sol";
import {FlexReceiveStateFacet} from "../facets/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../facets/FlexReceiveHashFacet.sol";
import {FlexConfirmNativeFacet} from "../facets/FlexConfirmNativeFacet.sol";
import {FlexConfirmNativeDomainFacet} from "../facets/FlexConfirmNativeDomainFacet.sol";
import {FlexSendNativeFacet} from "../facets/FlexSendNativeFacet.sol";
import {FlexSendNativeDomainFacet} from "../facets/FlexSendNativeDomainFacet.sol";
import {FlexSendTimeFacet} from "../facets/FlexSendTimeFacet.sol";
import {FlexSendHashFacet} from "../facets/FlexSendHashFacet.sol";

contract FlexReceiveStandalone is
    FlexReceiveNativeFacet,
    FlexReceiveNativeDomainFacet,
    FlexReceiveStateFacet,
    FlexReceiveHashFacet,
    FlexConfirmNativeFacet,
    FlexConfirmNativeDomainFacet,
    FlexSendNativeFacet,
    FlexSendNativeDomainFacet,
    FlexSendTimeFacet,
    FlexSendHashFacet
{
    constructor(
        bytes32 receiveNativeDomain_,
        bytes32 confirmNativeDomain_,
        bytes32 sendNativeDomain_
    )
        FlexReceiveNativeFacet(receiveNativeDomain_)
        FlexReceiveNativeDomainFacet(receiveNativeDomain_)
        FlexConfirmNativeFacet(confirmNativeDomain_, receiveNativeDomain_)
        FlexConfirmNativeDomainFacet(confirmNativeDomain_)
        FlexSendNativeFacet(sendNativeDomain_)
        FlexSendNativeDomainFacet(sendNativeDomain_)
    {}
}
