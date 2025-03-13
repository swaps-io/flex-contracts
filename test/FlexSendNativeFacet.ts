import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcSendNativeHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexEncodeSendNativeData,
  flexCalcBranch,
  FLEX_UNALLOCATED_HASH,
  flexCalcSendAccumulatorHash,
} from '@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here

describe('FlexSendNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, resolverClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    return {
      publicClient,
      walletClient,
      resolverClient,
      flex,
    };
  }

  it('Should send native', async function () {
    const { publicClient, walletClient, resolverClient, flex } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_000_000_000n;
    const group = 0;
    const sender = resolverClient.account.address;
    const receiver = walletClient.account.address;
    const amount = 123_456_789n;

    const sendNativeDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSendNativeDomain',
      args: [],
    });
    const sendNativeData = flexEncodeSendNativeData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
    });
    const sendNativeHash = flexCalcSendNativeHash({
      domain: sendNativeDomain,
      data: sendNativeData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [sendNativeHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const sendNativeBranch = flexCalcBranch({ tree: orderTree, leaf: sendNativeHash });

    let expectedSendHash: Hex;
    {
      const time = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(0);

      expectedSendHash = FLEX_UNALLOCATED_HASH;

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }

    {
      const balanceBefore = await publicClient.getBalance({ address: receiver });

      const hash = await resolverClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendNative',
        args: [
          sendNativeData.sendData[1],
          sendNativeBranch,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendNative gas (1st): ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSend',
        args: {
          orderHash,
        },
      });
      expect(logs.length).equal(1);

      const balance = await publicClient.getBalance({ address: receiver });
      expect(balance - balanceBefore).equal(amount);
    }

    {
      const time = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(start);

      expectedSendHash = flexCalcSendAccumulatorHash({
        hashBefore: expectedSendHash,
        orderHash,
        start,
      });

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }

    {
      const newSendNativeData = flexEncodeSendNativeData({
        sender,
        receiver,
        amount,
        start: start - 1, // Note - bad start
        duration,
        group,
      });
      const newSendNativeHash = flexCalcSendNativeHash({
        domain: sendNativeDomain,
        data: newSendNativeData,
      });
  
      const newComponentHashes = [newSendNativeHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newSendNativeBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendNativeHash });

      await expect(
        resolverClient.writeContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexSendNative',
          args: [
            newSendNativeData.sendData[1],
            newSendNativeBranch,
          ],
          value: amount,
        }),
      ).rejectedWith(
        'FlexChronologyError()', // Start time less than previous order in group is not allowed
      );
    }

    let newOrderHash: Hex;
    {
      const balanceBefore = await publicClient.getBalance({ address: receiver });

      const newSendNativeData = flexEncodeSendNativeData({
        sender,
        receiver,
        amount,
        start: start + 1, // Note - new start
        duration,
        group,
      });
      const newSendNativeHash = flexCalcSendNativeHash({
        domain: sendNativeDomain,
        data: newSendNativeData,
      });

      const newComponentHashes = [newSendNativeHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      newOrderHash = flexCalcTreeHash({ tree: newOrderTree });
      const newSendNativeBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendNativeHash });

      const hash = await resolverClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendNative',
        args: [
          newSendNativeData.sendData[1],
          newSendNativeBranch,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendNative gas (2nd): ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSend',
        args: {
          orderHash: newOrderHash,
        },
      });
      expect(logs.length).equal(1);

      const balance = await publicClient.getBalance({ address: receiver });
      expect(balance - balanceBefore).equal(amount);
    }

    {
      const time = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(start + 1);

      expectedSendHash = flexCalcSendAccumulatorHash({
        hashBefore: expectedSendHash,
        orderHash: newOrderHash,
        start: start + 1,
      });

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }
  });
});
