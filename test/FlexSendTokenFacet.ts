import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcSendTokenHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexEncodeSendTokenData,
  flexCalcBranch,
  flexCalcSendAccumulatorHash,
  FLEX_UNALLOCATED_HASH,
} from '@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here

describe('FlexSendTokenFacet', function () {
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

    const sendTokenDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSendTokenDomain',
      args: [],
    });
    const sendTokenData = flexEncodeSendTokenData({
      sender,
      receiver,
      token: token.address,
      amount,
      start,
      duration,
      group,
    });
    const sendTokenHash = flexCalcSendTokenHash({
      domain: sendTokenDomain,
      data: sendTokenData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [sendTokenHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const sendTokenBranch = flexCalcBranch({ tree: orderTree, leaf: sendTokenHash });

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
        functionName: 'flexSendToken',
        args: [
          sendTokenData.sendData[1],
          sendTokenData.sendData[2],
          sendTokenData.sendData[3],
          sendTokenBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendToken gas (1st): ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSend',
        args: {
          orderHash,
        },
      });
      expect(logs.length).equal(1);

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          receiver,
        ],
      });
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
      const newSendTokenData = flexEncodeSendTokenData({
        sender,
        receiver,
        token: token.address,
        amount,
        start: start - 1, // Note - bad start
        duration,
        group,
      });
      const newSendTokenHash = flexCalcSendTokenHash({
        domain: sendTokenDomain,
        data: newSendTokenData,
      });
  
      const newComponentHashes = [newSendTokenHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newSendTokenBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendTokenHash });

      await expect(
        resolverClient.writeContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexSendToken',
          args: [
            newSendTokenData.sendData[1],
            newSendTokenData.sendData[2],
            newSendTokenData.sendData[3],
            newSendTokenBranch,
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

      const newSendTokenData = flexEncodeSendTokenData({
        sender,
        receiver,
        token: token.address,
        amount,
        start: start + 1, // Note - new start
        duration,
        group,
      });
      const newSendTokenHash = flexCalcSendTokenHash({
        domain: sendTokenDomain,
        data: newSendTokenData,
      });

      const newComponentHashes = [newSendTokenHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      newOrderHash = flexCalcTreeHash({ tree: newOrderTree });
      const newSendTokenBranch = flexCalcBranch({ tree: newOrderTree, leaf: newSendTokenHash });

      const hash = await resolverClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendToken',
        args: [
          newSendTokenData.sendData[1],
          newSendTokenData.sendData[2],
          newSendTokenData.sendData[3],
          newSendTokenBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendToken gas (2nd): ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSend',
        args: {
          orderHash: newOrderHash,
        },
      });
      expect(logs.length).equal(1);

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          receiver,
        ],
      });
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
