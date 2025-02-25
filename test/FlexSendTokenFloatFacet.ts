import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcSendTokenFloatHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcAccumulatorHash,
  flexEncodeSendTokenFloatData,
  flexCalcBranch,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here

describe('FlexSendTokenFloatFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, resolverClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      resolverClient,
      flex,
      token,
    };
  }

  it('Should send native', async function () {
    const { publicClient, walletClient, resolverClient, flex, token } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_000_000_000n;
    const group = 0;
    const sender = resolverClient.account.address;
    const receiver = walletClient.account.address;
    const amount = 123_456_789n;
    const actualAmount = amount + 1337n;
    const skipAmountEmit = false;

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingReceiverAmount = 2_496n;

    await resolverClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        sender,
        amount + amount + remainingSenderAmount,
      ],
    });
    await resolverClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'approve',
      args: [
        flex.address,
        amount + amount + remainingSenderAllowance,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        receiver,
        existingReceiverAmount,
      ],
    });

    const sendTokenFloatDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSendTokenFloatDomain',
      args: [],
    });
    const sendTokenFloatData = flexEncodeSendTokenFloatData({
      sender,
      receiver,
      token: token.address,
      amount,
      start,
      duration,
      group,
      skipAmountEmit,
    });
    const sendTokenFloatHash = flexCalcSendTokenFloatHash({
      domain: sendTokenFloatDomain,
      data: sendTokenFloatData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [sendTokenFloatHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const sendTokenFloatBranch = flexCalcBranch({ tree: orderTree, leaf: sendTokenFloatHash });

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

      expectedSendHash = zeroAddress;

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
      const balanceBefore = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          receiver,
        ],
      });

      const hash = await resolverClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendTokenFloat',
        args: [
          sendTokenFloatData.sendData[1],
          sendTokenFloatData.sendData[2],
          sendTokenFloatData.sendData[3],
          actualAmount,
          sendTokenFloatBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendTokenFloat gas (1st): ${receipt.gasUsed}`);

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

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          receiver,
        ],
      });
      expect(balance - balanceBefore).equal(actualAmount);
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

      expectedSendHash = flexCalcAccumulatorHash({ hashBefore: expectedSendHash, hashToAdd: orderHash });

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
      const newSendTokenFloatData = flexEncodeSendTokenFloatData({
        sender,
        receiver,
        token: token.address,
        amount,
        start: start - 1, // Note - bad start
        duration,
        group,
        skipAmountEmit,
      });
      const newSendTokenFloatHash = flexCalcSendTokenFloatHash({
        domain: sendTokenFloatDomain,
        data: newSendTokenFloatData,
      });
  
      const newComponentHashes = [newSendTokenFloatHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newSendTokenFloatBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendTokenFloatHash });

      await expect(
        resolverClient.writeContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexSendTokenFloat',
          args: [
            newSendTokenFloatData.sendData[1],
            newSendTokenFloatData.sendData[2],
            newSendTokenFloatData.sendData[3],
            actualAmount,
            newSendTokenFloatBranch,
          ],
        }),
      ).rejectedWith(
        'FlexChronologyError()', // Start time less than previous order in group is not allowed
      );
    }

    let newOrderHash: Hex;
    {
      const balanceBefore = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          receiver,
        ],
      });

      const newSendTokenFloatData = flexEncodeSendTokenFloatData({
        sender,
        receiver,
        token: token.address,
        amount,
        start: start + 1, // Note - new start
        duration,
        group,
        skipAmountEmit,
      });
      const newSendTokenFloatHash = flexCalcSendTokenFloatHash({
        domain: sendTokenFloatDomain,
        data: newSendTokenFloatData,
      });

      const newComponentHashes = [newSendTokenFloatHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      newOrderHash = flexCalcTreeHash({ tree: newOrderTree });
      const newSendTokenFloatBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendTokenFloatHash });

      const hash = await resolverClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendTokenFloat',
        args: [
          newSendTokenFloatData.sendData[1],
          newSendTokenFloatData.sendData[2],
          newSendTokenFloatData.sendData[3],
          actualAmount,
          newSendTokenFloatBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendTokenFloat gas (2nd): ${receipt.gasUsed}`);

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

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          receiver,
        ],
      });
      expect(balance - balanceBefore).equal(actualAmount);
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

      expectedSendHash = flexCalcAccumulatorHash({ hashBefore: expectedSendHash, hashToAdd: newOrderHash });

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
