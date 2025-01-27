// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveNativeFactory {
    event FlexConfirmNative(bytes32 indexed orderHash);
    event FlexRefundNative(bytes32 indexed orderHash);

    function flexBoxProto() external view returns (address);

    function flexConfirmNativeDomain() external view returns (bytes32);

    function flexRefundNativeDomain() external view returns (bytes32);

    function flexPredictNativeBox(bytes32 orderHash) external view returns (address);

    function flexConfirmNative(
        bytes32 paramBundle0, // Content: <unused> (96), confirm receiver (160)
        bytes32 paramBundle1, // Content: confirm key hash (256)
        bytes32 paramBundle2, // Content: confirm key (256)
        bytes32[] calldata confirmBranch
    ) external;
}
