import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Hex, zeroAddress } from 'viem';

import {
  flexEncodeAllocateSendData0,
  FLEX_UNALLOCATED_HASH,
  FLEX_ALLOCATED_HASH,
} from '../@swaps-io/flex-sdk';

const TOTAL_ALLOCATE_BUCKETS = 5;

describe('FlexAllocateSendFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    return {
      publicClient,
      walletClient,
      flex,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexAllocateSendFacet'));
  });

  it('Should allocate send state', async function () {
    const { publicClient, walletClient, flex } = await loadFixture(deployFixture);

    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const startGroup = 3; // Included
    const totalBuckets = TOTAL_ALLOCATE_BUCKETS;

    const endGroup = startGroup + totalBuckets; // Excluded

    const allocateData0 = flexEncodeAllocateSendData0({
      sender,
      startGroup,
      totalBuckets,
    });

    async function readSendHash(group: number): Promise<Hex> {
      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      return hash;
    }

    {
      {
        const hash = await readSendHash(startGroup - 1);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }

      for (let group = startGroup; group < endGroup; group++) {
        const hash = await readSendHash(group);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }

      {
        const hash = await readSendHash(endGroup);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }
    }

    {
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexAllocateSend',
        args: [
          allocateData0,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexAllocateSend gas (${totalBuckets} buckets): ${receipt.gasUsed}`);
    }

    {
      {
        const hash = await readSendHash(startGroup - 1);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }

      for (let group = startGroup; group < endGroup; group++) {
        const hash = await readSendHash(group);
        expect(hash).equal(FLEX_ALLOCATED_HASH);
      }

      {
        const hash = await readSendHash(endGroup);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }
    }
  });
});
