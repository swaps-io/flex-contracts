import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import {
  getAbiItem,
  Hex,
  toFunctionSelector,
  toFunctionSignature,
} from 'viem';

import {
  encodeFlexAllocateSendData0,
  FLEX_UNALLOCATED_HASH,
  FLEX_ALLOCATED_HASH,
} from '../@swaps-io/flex-sdk';

const TOTAL_ALLOCATE_BUCKETS = 5;

describe('FlexAllocateSend', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const sendNativeDomain = '0xabababababababababababababababababababababababababababababababab'; // For standalone

    // Includes `FlexAllocateSendFacet`
    const flexSendStandalone = await viem.deployContract(
      'FlexSendNativeStandalone',
      [
        sendNativeDomain,
      ],
    );

    const flexAllocateSendFacet = await viem.deployContract('FlexAllocateSendFacet');

    return {
      publicClient,
      walletClient,
      flexSendStandalone,
      flexAllocateSendFacet,
    };
  }

  it('Should show FlexAllocateSendFacet code', async function () {
    const { publicClient, flexAllocateSendFacet } = await loadFixture(deployFixture);

    const code = await publicClient.getCode({ address: flexAllocateSendFacet.address });
    console.log(`flexAllocateSendFacet code: ${code}`);
  });

  it('Should show FlexAllocateSendFacet function selectors', async function () {
    const { flexAllocateSendFacet } = await loadFixture(deployFixture);

    console.log('FlexAllocateSendFacet selectors:');
    for (const abi of flexAllocateSendFacet.abi) {
      if (abi.type !== 'function') {
        continue;
      }

      const item = getAbiItem({ abi: flexAllocateSendFacet.abi, name: abi.name });
      const signature = toFunctionSignature(item);
      const selector = toFunctionSelector(item);
      console.log(`- ${selector}: ${signature}`);
    }
  });

  it('Should allocate receive state', async function () {
    const { publicClient, walletClient, flexSendStandalone } = await loadFixture(deployFixture);

    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const startGroup = 3; // Included
    const totalBuckets = TOTAL_ALLOCATE_BUCKETS;

    const endGroup = startGroup + totalBuckets; // Excluded

    const allocateData0 = encodeFlexAllocateSendData0({
      sender,
      startGroup,
      totalBuckets,
    });

    async function readSendHash(group: number): Promise<Hex> {
      const hash = await publicClient.readContract({
        abi: flexSendStandalone.abi,
        address: flexSendStandalone.address,
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
        abi: flexSendStandalone.abi,
        address: flexSendStandalone.address,
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
