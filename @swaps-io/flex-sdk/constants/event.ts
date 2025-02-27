// event FlexReceive(bytes32 indexed orderHash)
// keccak256("FlexReceive(bytes32)")
export const FLEX_RECEIVE_EVENT_SIGNATURE = '0xfabb7d0b9973f4d91a1a9496a36df190d6158a0c7554781b8fa5f72236deec1f';

// event FlexConfirm(bytes32 indexed orderHash)
// keccak256("FlexConfirm(bytes32)")
export const FLEX_CONFIRM_EVENT_SIGNATURE = '0x1ae8fa0e975885618fcd7a87434d2cd76b3d63e9aeb10f069a536820ea19909a';

// event FlexRefund(bytes32 indexed orderHash)
// keccak256("FlexRefund(bytes32)")
export const FLEX_REFUND_EVENT_SIGNATURE = '0x86bdd8ce21caee68dede9469afaff76fb0e1b2a29f2324f7e9375934a787a51c';

// event FlexSend(bytes32 indexed orderHash)
// keccak256("FlexSend(bytes32)")
export const FLEX_SEND_EVENT_SIGNATURE = '0x4cea8b710e627c582bfc256cb3c9376be297ee5431867ac173e1f2b08b372613';

// event FlexSendAmount(bytes32 orderHash, uint256 amount)
// keccak256("FlexSendAmount(bytes32,uint256)")
export const FLEX_SEND_AMOUNT_EVENT_SIGNATURE = '0x1178358da04959a2bba169278fda41863bbe6379f3a112f6c6f8921b7fce1c85';

// event FlexSendSave(bytes32 indexed bucket, bytes32 bucketState, bytes32 saveBucket);
// keccak256("FlexSendSave(bytes32,bytes32,bytes32)")
export const FLEX_SEND_SAVE_EVENT_SIGNATURE = '0x18f4b0b3fca5b88f1288caa890e382a0e49c3c4a82aaf23df30a90c042940b71';

// event FlexSendFail(bytes32 indexed orderHash)
// keccak256("FlexSendFail(bytes32)")
export const FLEX_SEND_FAIL_EVENT_SIGNATURE = '0xff0a1efb6bc8bbe9de4826e06fdd6ae11433a17120695e65a4f96b4f7fb62563';
