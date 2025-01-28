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
        bytes32 confirmData0, // Content: <unused> (96), confirm receiver (160)
        bytes32 confirmData1, // Content: confirm key hash (256)
        bytes32 confirmData2, // Content: confirm key (256)
        bytes32[] calldata confirmBranch
    ) external;

    function flexRefundNative(
        bytes32 refundData0, // Content: <unused> (96), refund receiver (160)
        bytes32 refundData1, // Content: refund key hash (256)
        bytes32 refundData2, // Content: refund key (256)
        bytes32[] calldata refundBranch
    ) external;
}
