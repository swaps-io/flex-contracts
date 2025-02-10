import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import {
  getAbiItem,
  toFunctionSelector,
  zeroAddress,
} from 'viem';

describe('Diamond', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const test1Facet = await viem.deployContract('Test1Facet');

    const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

    const diamond = await viem.deployContract('Diamond', [walletClient.account.address, diamondCutFacet.address]);
    await walletClient.writeContract({
      abi: diamondCutFacet.abi,
      address: diamond.address,
      functionName: 'diamondCut',
      args: [
        [
          {
            action: 0, // Add
            facetAddress: test1Facet.address,
            functionSelectors: [
              toFunctionSelector(
                getAbiItem({
                  abi: test1Facet.abi,
                  name: 'test1Func1',
                }),
              ),
            ],
          },
        ],
        zeroAddress,
        '0x',
      ],
    });

    return {
      publicClient,
      walletClient,
      diamond,
      test1Facet,
    };
  }

  it('Should compare direct and diamond call gas', async function () {
    const { publicClient, walletClient, diamond, test1Facet } = await loadFixture(deployFixture);

    let directGas: bigint;
    {
      const hash = await walletClient.writeContract({
        abi: test1Facet.abi,
        address: test1Facet.address,
        functionName: 'test1Func1',
        args: [],
      });
      const receipt = await publicClient.getTransactionReceipt({ hash });
      directGas = receipt.gasUsed;
    }

    let diamondGas: bigint;
    {
      const hash = await walletClient.writeContract({
        abi: test1Facet.abi,
        address: diamond.address,
        functionName: 'test1Func1',
        args: [],
      });
      const receipt = await publicClient.getTransactionReceipt({ hash });
      diamondGas = receipt.gasUsed;
    }

    {
      const gasOverhead = diamondGas - directGas;
      console.log(`Diamond gas overhead comparing to direct call: ${gasOverhead}`);
    }
  });
});
