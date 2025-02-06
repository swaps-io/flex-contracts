// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexAllocateSend {
    function flexAllocateSend(
        bytes32 allocateData0 // Content: total buckets (48), start sender group (48), sender (160)
    ) external;
}
