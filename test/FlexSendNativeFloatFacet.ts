import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcSendNativeFloatHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexEncodeSendNativeFloatData,
  flexCalcBranch,
  flexCalcSendAccumulatorHash,
  FLEX_UNALLOCATED_HASH,
  FLEX_SEND_STATE_NONE,
  FLEX_SEND_STATE_SENT,
} from '@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here

describe('FlexSendNativeFloatFacet', function () {
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
    const actualAmount = amount + 1337n;
    const skipAmountEmit = false;

    const sendNativeFloatDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSendNativeFloatDomain',
      args: [],
    });
    const sendNativeFloatData = flexEncodeSendNativeFloatData({
      sender,
      receiver,
      amount,
      deadline,
      nonce,
      skipAmountEmit,
    });
    const sendNativeFloatHash = flexCalcSendNativeFloatHash({
      domain: sendNativeFloatDomain,
      data: sendNativeFloatData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [sendNativeFloatHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const sendNativeFloatBranch = flexCalcBranch({ tree: orderTree, leaf: sendNativeFloatHash });

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
        functionName: 'flexSendNativeFloat',
        args: [
          sendNativeFloatData.sendData[1],
          sendNativeFloatData.sendData[2],
          sendNativeFloatBranch,
        ],
        value: actualAmount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendNativeFloat gas (1st): ${receipt.gasUsed}`);

      let sendLogIndex: number;
      {
        const logs = parseEventLogs({
          abi: flex.abi,
          logs: receipt.logs,
          eventName: 'FlexSend',
          args: {
            orderHash,
          },
        });
        expect(logs.length).equal(1);
        sendLogIndex = logs[0].logIndex;
      }

      let sendAmountLogIndex: number;
      {
        const logs = parseEventLogs({
          abi: flex.abi,
          logs: receipt.logs,
          eventName: 'FlexSendAmount',
          args: {
            orderHash,
            amount: actualAmount,
          },
        });
        expect(logs.length).equal(1);
        sendAmountLogIndex = logs[0].logIndex;
      }

      expect(sendLogIndex).lessThan(sendAmountLogIndex);

      const balance = await publicClient.getBalance({ address: receiver });
      expect(balance - balanceBefore).equal(actualAmount);
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
      const newSendNativeFloatData = flexEncodeSendNativeFloatData({
        sender,
        receiver,
        amount,
        deadline,
        nonce, // Note - bad nonce (already used)
        skipAmountEmit,
      });
      const newSendNativeFloatHash = flexCalcSendNativeFloatHash({
        domain: sendNativeFloatDomain,
        data: newSendNativeFloatData,
      });
  
      const newComponentHashes = [newSendNativeFloatHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newSendNativeFloatBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendNativeFloatHash });

      await expect(
        resolverClient.writeContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexSendNativeFloat',
          args: [
            newSendNativeFloatData.sendData[1],
            newSendNativeFloatData.sendData[2],
            newSendNativeFloatBranch,
          ],
          value: actualAmount,
        }),
      ).rejectedWith(
        'FlexStateError()', // Nonce is already in "sent" state
      );
    }

    let newOrderHash: Hex;
    {
      const balanceBefore = await publicClient.getBalance({ address: receiver });

      const newSendNativeFloatData = flexEncodeSendNativeFloatData({
        sender,
        receiver,
        amount,
        deadline,
        nonce: nonce + 1n, // Note - new nonce
        skipAmountEmit,
      });
      const newSendNativeFloatHash = flexCalcSendNativeFloatHash({
        domain: sendNativeFloatDomain,
        data: newSendNativeFloatData,
      });

      const newComponentHashes = [newSendNativeFloatHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      newOrderHash = flexCalcTreeHash({ tree: newOrderTree });
      const newSendNativeFloatBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendNativeFloatHash });

      const hash = await resolverClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendNativeFloat',
        args: [
          newSendNativeFloatData.sendData[1],
          newSendNativeFloatData.sendData[2],
          newSendNativeFloatBranch,
        ],
        value: actualAmount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendNativeFloat gas (2nd): ${receipt.gasUsed}`);

      let sendLogIndex: number;
      {
        const logs = parseEventLogs({
          abi: flex.abi,
          logs: receipt.logs,
          eventName: 'FlexSend',
          args: {
            orderHash: newOrderHash,
          },
        });
        expect(logs.length).equal(1);
        sendLogIndex = logs[0].logIndex;
      }

      let sendAmountLogIndex: number;
      {
        const logs = parseEventLogs({
          abi: flex.abi,
          logs: receipt.logs,
          eventName: 'FlexSendAmount',
          args: {
            orderHash: newOrderHash,
            amount: actualAmount,
          },
        });
        expect(logs.length).equal(1);
        sendAmountLogIndex = logs[0].logIndex;
      }

      expect(sendLogIndex).lessThan(sendAmountLogIndex);

      const balance = await publicClient.getBalance({ address: receiver });
      expect(balance - balanceBefore).equal(actualAmount);
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
