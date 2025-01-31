import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { ContractTypesMap } from 'hardhat/types/artifacts';
import { expect } from 'chai';
import {
  AccessList,
  Address,
  bytesToHex,
  concat,
  getAbiItem,
  Hex,
  keccak256,
  pad,
  slice,
  sliceHex,
  stringToHex,
  toFunctionSelector,
  toFunctionSignature,
  zeroAddress,
} from 'viem';

import {
  calcFlexReceiveNativeBranch,
  calcFlexReceiveNativeHash,
  calcFlexTree,
  calcFlexTreeHash,
  encodeFlexReceiveNativeData0,
  encodeFlexReceiveNativeData1,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65;
const INSIDE_DIAMOND = false; // Diamond or standalone
const ACCESS_LIST_DIAMOND = false; // Needs INSIDE_DIAMOND
const ACCESS_LIST_DIAMOND_GOOD_ONLY = true; // Needs ACCESS_LIST_DIAMOND

describe('FlexReceiveNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flexReceiveNativeDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';
    const flexConfirmNativeDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // For standalone

    let flex: { address: Address };
    let flexReceiveNativeFacet: ContractTypesMap['FlexReceiveNativeFacet'];
    let flexReceiveNativeDomainFacet: ContractTypesMap['FlexReceiveNativeDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveNativeFacet = await viem.deployContract('FlexReceiveNativeFacet', [flexReceiveNativeDomain]);
      flexReceiveNativeDomainFacet = await viem.deployContract('FlexReceiveNativeDomainFacet', [flexReceiveNativeDomain]);
      flexReceiveStateFacet = await viem.deployContract('FlexReceiveStateFacet');
      flexReceiveHashFacet = await viem.deployContract('FlexReceiveHashFacet');

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
            {
              action: 0, // Add
              facetAddress: flexReceiveNativeDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveNativeDomainFacet.abi,
                    name: 'flexReceiveNativeDomain',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveStateFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveStateFacet.abi,
                    name: 'flexReceiveState',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveHashFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveHashFacet.abi,
                    name: 'flexReceiveHash',
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
      flex = await viem.deployContract(
        'FlexReceiveStandalone',
        [
          flexReceiveNativeDomain,
          flexConfirmNativeDomain,
        ],
      );

      flexReceiveNativeFacet = flex as ContractTypesMap['FlexReceiveNativeFacet'];
      flexReceiveNativeDomainFacet = flex as ContractTypesMap['FlexReceiveNativeDomainFacet'];
      flexReceiveStateFacet = flex as ContractTypesMap['FlexReceiveStateFacet'];
      flexReceiveHashFacet = flex as ContractTypesMap['FlexReceiveHashFacet'];
    }

    const resolver = await viem.deployContract('ResolverTest');

    return {
      publicClient,
      walletClient,
      resolver,
      flex,
      flexReceiveNativeFacet,
      flexReceiveNativeDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexReceiveNativeFacet code', async function () {
      const { publicClient, flexReceiveNativeFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexReceiveNativeFacet.address });
      console.log(`FlexReceiveNativeFacet code: ${code}`);
    });

    it('Should show FlexReceiveNativeDomainFacet code', async function () {
      const { publicClient, flexReceiveNativeDomainFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexReceiveNativeDomainFacet.address });
      console.log(`FlexReceiveNativeDomainFacet code: ${code}`);
    });

    it('Should show FlexReceiveStateFacet code', async function () {
      const { publicClient, flexReceiveStateFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexReceiveStateFacet.address });
      console.log(`FlexReceiveStateFacet code: ${code}`);
    });

    it('Should show FlexReceiveHashFacet code', async function () {
      const { publicClient, flexReceiveHashFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexReceiveHashFacet.address });
      console.log(`FlexReceiveHashFacet code: ${code}`);
    });

    it('Should show FlexReceiveNativeFacet function selectors', async function () {
      const { flexReceiveNativeFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveNativeFacet selectors:');
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
  
    it('Should show FlexReceiveNativeDomainFacet function selectors', async function () {
      const { flexReceiveNativeDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveNativeDomainFacet selectors:');
      for (const abi of flexReceiveNativeDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexReceiveNativeDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

    it('Should show FlexReceiveStateFacet function selectors', async function () {
      const { flexReceiveStateFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveStateFacet selectors:');
      for (const abi of flexReceiveStateFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexReceiveStateFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

    it('Should show FlexReceiveHashFacet function selectors', async function () {
      const { flexReceiveHashFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveStateFacet selectors:');
      for (const abi of flexReceiveHashFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexReceiveHashFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  } else {
  //

    it('Should show FlexReceiveStandalone code', async function () {
      const { publicClient, flex } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flex.address });
      console.log(`flexReceiveStandalone code: ${code}`);
    });

    it('Should show FlexReceiveStandalone function selectors', async function () {
      const { flexReceiveHashFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveStateFacet selectors:');
      for (const abi of flexReceiveHashFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexReceiveHashFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should receive native', async function () {
    const {
      flex,
      flexReceiveNativeFacet,
      flexReceiveNativeDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      walletClient,
      publicClient,
      resolver,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const amount = 123_456_789n;

    const receiveDomain = await publicClient.readContract({
      abi: flexReceiveNativeDomainFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveNativeDomain',
      args: [],
    });
    const receiveData0 = encodeFlexReceiveNativeData0({
      deadline,
      nonce,
      receiver,
    });
    const receiveData1 = encodeFlexReceiveNativeData1({
      amount,
    });
    const receiveHash = calcFlexReceiveNativeHash({
      domain: receiveDomain,
      data0: receiveData0,
      data1: receiveData1,
    });

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveHash, ...imaginaryComponentHashes];
    const orderTree = calcFlexTree({ leaves: componentHashes });
    const orderHash = calcFlexTreeHash({ tree: orderTree });

    const receiveComponentBranch = calcFlexReceiveNativeBranch({
      tree: orderTree,
      receiveNativeHash: receiveHash,
    });

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

    let expectedReceiveHash: Hex;
    {
      const state = await publicClient.readContract({
        abi: flexReceiveStateFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(0); // FlexReceiveState.None

      expectedReceiveHash = zeroAddress;

      const hash = await publicClient.readContract({
        abi: flexReceiveHashFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(hash).equal(expectedReceiveHash);
    }

    {
      const hash = await walletClient.writeContract({
        abi: flexReceiveNativeFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveNative',
        args: [
          receiveData0,
          receiveComponentBranch,
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
      const state = await publicClient.readContract({
        abi: flexReceiveStateFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(1); // FlexReceiveState.Received

      expectedReceiveHash = sliceHex(keccak256(concat([expectedReceiveHash, orderHash])), 0, 20);

      const hash = await publicClient.readContract({
        abi: flexReceiveHashFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(hash).equal(expectedReceiveHash);
    }

    await expect(
      walletClient.writeContract({
        abi: flexReceiveNativeFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveNative',
        args: [
          receiveData0,
          receiveComponentBranch,
          receiverSignature,
        ],
        value: amount,
        accessList,
      }),
    ).rejectedWith(
      'FlexStateError()', // Same order used (receiver nonce already in `Received` state)
    );

    {
      const newNonce = 424_243n; // +1

      {
        const state = await publicClient.readContract({
          abi: flexReceiveStateFacet.abi,
          address: flex.address,
          functionName: 'flexReceiveState',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(state).equal(0); // FlexReceiveState.None

        const hash = await publicClient.readContract({
          abi: flexReceiveHashFacet.abi,
          address: flex.address,
          functionName: 'flexReceiveHash',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(hash).equal(expectedReceiveHash);
      }

      const newReceiveData0 = encodeFlexReceiveNativeData0({
        deadline,
        nonce: newNonce,
        receiver,
      });
      const newReceiveHash = calcFlexReceiveNativeHash({
        domain: receiveDomain,
        data0: newReceiveData0,
        data1: receiveData1,
      });

      const newComponentHashes = [newReceiveHash, ...imaginaryComponentHashes];
      const newOrderTree = calcFlexTree({ leaves: newComponentHashes });
      const newOrderHash = calcFlexTreeHash({ tree: newOrderTree });

      const receiveComponentBranch = calcFlexReceiveNativeBranch({
        tree: newOrderTree,
        receiveNativeHash: newReceiveHash,
      });

      const hash = await walletClient.writeContract({
        abi: flexReceiveNativeFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveNative',
        args: [
          newReceiveData0,
          receiveComponentBranch,
          receiverSignature,
        ],
        value: amount,
        accessList,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveNative gas (2nd): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: flex.address });
      expect(balance).equal(amount + amount);

      {
        const state = await publicClient.readContract({
          abi: flexReceiveStateFacet.abi,
          address: flex.address,
          functionName: 'flexReceiveState',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(state).equal(1); // FlexReceiveState.Received

        expectedReceiveHash = sliceHex(keccak256(concat([expectedReceiveHash, newOrderHash])), 0, 20);

        const hash = await publicClient.readContract({
          abi: flexReceiveHashFacet.abi,
          address: flex.address,
          functionName: 'flexReceiveHash',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(hash).equal(expectedReceiveHash);
      }
    }

    {
      const state = await publicClient.readContract({
        abi: flexReceiveStateFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(1); // FlexReceiveState.Received

      const hash = await publicClient.readContract({
        abi: flexReceiveHashFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(hash).equal(expectedReceiveHash);
    }
  });
});
