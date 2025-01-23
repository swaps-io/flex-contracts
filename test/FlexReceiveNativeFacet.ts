import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { AccessList, Address, bytesToHex, concat, getAbiItem, Hex, keccak256, pad, slice, stringToHex, toFunctionSelector, toFunctionSignature, zeroAddress } from 'viem';

import { encodeFlexReceiveNativeParamBundle } from '../lib/encode/flexReceiveNative';
import { expect } from 'chai';

const COMPONENT_BRANCH_WORDS = 2;
const RECEIVER_SIGNATURE_BYTES = 65;
const INSIDE_DIAMOND = true;
const ACCESS_LIST_DIAMOND = false; // Needs INSIDE_DIAMOND
const ACCESS_LIST_DIAMOND_GOOD_ONLY = true; // Needs ACCESS_LIST_DIAMOND

describe('FlexReceiveNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flexReceiveNativeDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';

    const flexReceiveNativeFacet = await viem.deployContract('FlexReceiveNativeFacet', [flexReceiveNativeDomain]);

    let flex: { address: Address };
    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flex = await viem.deployContract('Diamond', [walletClient.account.address, diamondCutFacet.address]);
      await walletClient.writeContract({
        abi: diamondCutFacet.abi,
        address: flex.address,
        functionName: 'diamondCut',
        args: [
          [
            {
              action: 0, // Add
              facetAddress: flexReceiveNativeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveNativeFacet.abi,
                    name: 'flexReceiveNative',
                  }),
                ),
              ],
            },
          ],
          zeroAddress,
          '0x',
        ],
      });
    } else {
      flex = flexReceiveNativeFacet;
    }

    const resolver = await viem.deployContract('ResolverTest');

    return {
      publicClient,
      walletClient,
      resolver,
      flex,
      flexReceiveNativeFacet,
      flexReceiveNativeDomain,
    };
  }

  it('Should show code', async function () {
    const { publicClient, flexReceiveNativeFacet } = await loadFixture(deployFixture);

    const code = await publicClient.getCode({ address: flexReceiveNativeFacet.address });
    console.log(`Code: ${code}`);
  });

  it('Should show function selectors', async function () {
    const { flexReceiveNativeFacet } = await loadFixture(deployFixture);

    console.log('Selectors:');
    for (const abi of flexReceiveNativeFacet.abi) {
      if (abi.type !== 'function') {
        continue;
      }

      const item = getAbiItem({ abi: flexReceiveNativeFacet.abi, name: abi.name });
      const signature = toFunctionSignature(item);
      const selector = toFunctionSelector(item);
      console.log(`- ${selector}: ${signature}`);
    }
  });

  it('Should receive native from user', async function () {
    const { flex, flexReceiveNativeFacet, walletClient, publicClient, resolver } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const group = 0n;
    const receiver = resolver.address;
    const amount = 123_456_789n;

    const paramBundle = encodeFlexReceiveNativeParamBundle({
      deadline,
      nonce,
      group,
      receiver,
    });

    // Imaginary data. Each node adds 700 gas approximately (512 (16*32) is calldata)
    const componentBranch: Hex[] = [];
    for (let i = 0; i < COMPONENT_BRANCH_WORDS; i++) {
      componentBranch.push(bytesToHex(crypto.getRandomValues(new Uint8Array(32))));
    }

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(RECEIVER_SIGNATURE_BYTES)));

    let accessList: AccessList[number][] | undefined;
    if (ACCESS_LIST_DIAMOND && INSIDE_DIAMOND) {
      accessList ??= [];
      accessList.push({ address: flexReceiveNativeFacet.address, storageKeys: [] }); // Saves 120 gas
      accessList.push({ address: resolver.address, storageKeys: [] }); // Saves 120 gas

      // 🚨 Looses 2300 gas: save: 2000, cost 2400+1900
      if (!ACCESS_LIST_DIAMOND_GOOD_ONLY) {
        // Diamond implementation slot calc:
        // - LibDiamond.DIAMOND_STORAGE_POSITION -> struct DiamondStorage
        // - DiamondStorage.selectorToFacetAndPosition (+0) -> mapping(bytes4 => FacetAddressAndPosition)
        // - FacetAddressAndPosition.facetAddress (+0) -> address

        const diamondSlot = keccak256(
          concat([
            pad(
              toFunctionSelector(
                getAbiItem({
                  abi: flexReceiveNativeFacet.abi,
                  name: 'flexReceiveNative',
                }),
              ),
              { dir: 'right' },
            ),
            keccak256(
              stringToHex('diamond.standard.diamond.storage'),
            ),
          ]),
        );

        const slotValue = await publicClient.getStorageAt({ address: flex.address, slot: diamondSlot });
        expect(slice(slotValue!, 12)).equal(flexReceiveNativeFacet.address);

        accessList.push({ address: flex.address, storageKeys: [diamondSlot] });
      }
    }

    {
      const hash = await walletClient.writeContract({
        abi: flexReceiveNativeFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveNative',
        args: [
          paramBundle,
          componentBranch,
          receiverSignature,
        ],
        value: amount,
        accessList,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveNative gas (1st): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: flex.address });
      expect(balance).equal(amount);
    }

    {
      const hash = await walletClient.writeContract({
        abi: flexReceiveNativeFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveNative',
        args: [
          paramBundle,
          componentBranch,
          receiverSignature,
        ],
        value: amount,
        accessList,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveNative gas (2nd): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: flex.address });
      expect(balance).equal(amount + amount);
    }
  });
});
