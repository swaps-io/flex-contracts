import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { AccessList, bytesToHex, concat, getCreateAddress, Hex, keccak256, numberToHex } from 'viem';
import { expect } from 'chai';

import { commutativeKeccak256 } from '../@swaps-io/flex-sdk';

const COMPONENT_BRANCH_WORDS = 2;
const ACCESS_LIST_PREDICTED_BOX = true; // 2000 gas loss
const ACCESS_LIST_RECEIVER = false; // 100 gas discount

describe('FlexReceiveNativeFactory', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, otherClient] = await viem.getWalletClients();

    const factoryAddress = getCreateAddress({
      from: walletClient.account.address,
      nonce: BigInt(await publicClient.getTransactionCount({ address: walletClient.account.address })) + 1n,
    });

    const flexConfirmNativeDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff' as const;
    const flexRefundNativeDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const;

    const proto = await viem.deployContract('FlexReceiveNativeBox', [factoryAddress]);
    const factory = await viem.deployContract('FlexReceiveNativeFactory', [proto.address, flexConfirmNativeDomain, flexRefundNativeDomain]);
    expect(factory.address).equal(factoryAddress.toLowerCase());

    return {
      publicClient,
      walletClient,
      otherClient,
      factory,
      flexConfirmNativeDomain,
      flexRefundNativeDomain,
    };
  }

  it('Should confirm native', async function () {
    const { publicClient, walletClient, otherClient, factory, flexConfirmNativeDomain } = await loadFixture(deployFixture);

    const confirmReceiver = otherClient.account.address;
    const orderAmount = 123_456_789n;

    const confirmBranch: Hex[] = [];
    for (let i = 0; i < COMPONENT_BRANCH_WORDS; i++) {
      confirmBranch.push(bytesToHex(crypto.getRandomValues(new Uint8Array(32))));
    }

    const confirmData0 = numberToHex(BigInt(confirmReceiver), { size: 32 });
    const confirmData1 = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
    const confirmData2 = keccak256(confirmData1);

    const confirmHash = keccak256(concat([flexConfirmNativeDomain, confirmData0, confirmData2]))

    let orderHash = confirmHash;
    for (const branchNode of confirmBranch) {
      orderHash = commutativeKeccak256(orderHash, branchNode);
    }

    const predictedBox = await factory.read.flexPredictNativeBox([orderHash]);

    let totalGas = 0n;
    {
      const hash = await walletClient.sendTransaction({
        to: predictedBox,
        value: orderAmount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`Send native gas: ${receipt.gasUsed}`);
      totalGas += receipt.gasUsed;
    }

    let accessList: AccessList[number][] | undefined;
    if (ACCESS_LIST_PREDICTED_BOX) {
      accessList ??= [];
      accessList.push({ address: predictedBox, storageKeys: [] });
    }
    if (ACCESS_LIST_RECEIVER) {
      accessList ??= [];
      accessList.push({ address: confirmReceiver, storageKeys: [] });
    }

    {
      const hash = await walletClient.writeContract({
        abi: factory.abi,
        address: factory.address,
        functionName: 'flexConfirmNative',
        args: [
          confirmData0,
          confirmData2,
          confirmData1,
          confirmBranch,
        ],
        accessList,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexConfirmNative gas: ${receipt.gasUsed}`);
      totalGas += receipt.gasUsed;

      const transaction = await publicClient.getTransaction({ hash });
      console.log(`flexConfirmNative calldata: ${transaction.input}`);
    }

    console.log(`Total gas: ${totalGas}`);
  });
});
