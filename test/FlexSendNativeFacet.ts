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
  FLEX_SEND_STATE_NONE,
  FLEX_SEND_STATE_SENT,
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

    const deadline = 4_000_123_456n;
    const nonce = 0n;
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
      deadline,
      nonce,
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
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendState',
        args: [
          sender,
          nonce,
        ],
      });
      expect(state).equal(FLEX_SEND_STATE_NONE);

      expectedSendHash = FLEX_UNALLOCATED_HASH;

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          nonce,
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
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendState',
        args: [
          sender,
          nonce,
        ],
      });
      expect(state).equal(FLEX_SEND_STATE_SENT);

      expectedSendHash = flexCalcSendAccumulatorHash({
        hashBefore: expectedSendHash,
        orderHash,
      });

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          nonce,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }

    {
      const newSendNativeData = flexEncodeSendNativeData({
        sender,
        receiver,
        amount,
        deadline,
        nonce, // Note - bad nonce (already used)
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
        'FlexStateError()', // Nonce is already in "sent" state
      );
    }

    let newOrderHash: Hex;
    {
      const balanceBefore = await publicClient.getBalance({ address: receiver });

      const newSendNativeData = flexEncodeSendNativeData({
        sender,
        receiver,
        amount,
        deadline,
        nonce: nonce + 1n, // Note - new nonce
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
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendState',
        args: [
          sender,
          nonce + 1n,
        ],
      });
      expect(state).equal(FLEX_SEND_STATE_SENT);

      expectedSendHash = flexCalcSendAccumulatorHash({
        hashBefore: expectedSendHash,
        orderHash: newOrderHash,
      });

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          nonce,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }
  });
});
