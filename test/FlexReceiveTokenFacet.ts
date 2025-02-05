import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { ContractTypesMap } from 'hardhat/types/artifacts';
import { expect } from 'chai';
import {
  Address,
  bytesToHex,
  concat,
  getAbiItem,
  Hex,
  keccak256,
  sliceHex,
  toFunctionSelector,
  toFunctionSignature,
  zeroAddress,
} from 'viem';

import {
  calcFlexReceiveTokenBranch,
  calcFlexReceiveTokenHash,
  calcFlexTree,
  calcFlexTreeHash,
  encodeFlexReceiveTokenData0,
  encodeFlexReceiveTokenData1,
  encodeFlexReceiveTokenData2,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65;
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexReceiveTokenFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flexReceiveTokenDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';
    const flexReceiveTokenFromDomain = '0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0'; // For standalone
    const flexConfirmTokenDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // For standalone
    const flexRefundTokenDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e'; // For standalone

    let flex: { address: Address };
    let flexReceiveTokenFacet: ContractTypesMap['FlexReceiveTokenFacet'];
    let flexReceiveTokenDomainFacet: ContractTypesMap['FlexReceiveTokenDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveTokenFacet = await viem.deployContract('FlexReceiveTokenFacet', [flexReceiveTokenDomain]);
      flexReceiveTokenDomainFacet = await viem.deployContract('FlexReceiveTokenDomainFacet', [flexReceiveTokenDomain]);
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
              facetAddress: flexReceiveTokenFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveTokenFacet.abi,
                    name: 'flexReceiveToken',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveTokenDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveTokenDomainFacet.abi,
                    name: 'flexReceiveTokenDomain',
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
        'FlexReceiveTokenStandalone',
        [
          flexReceiveTokenDomain,
          flexReceiveTokenFromDomain,
          flexConfirmTokenDomain,
          flexRefundTokenDomain,
        ],
      );

      flexReceiveTokenFacet = flex as ContractTypesMap['FlexReceiveTokenFacet'];
      flexReceiveTokenDomainFacet = flex as ContractTypesMap['FlexReceiveTokenDomainFacet'];
      flexReceiveStateFacet = flex as ContractTypesMap['FlexReceiveStateFacet'];
      flexReceiveHashFacet = flex as ContractTypesMap['FlexReceiveHashFacet'];
    }

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      resolver,
      flex,
      flexReceiveTokenFacet,
      flexReceiveTokenDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      token,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexReceiveTokenFacet code', async function () {
      const { publicClient, flexReceiveTokenFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexReceiveTokenFacet.address });
      console.log(`FlexReceiveTokenFacet code: ${code}`);
    });

    it('Should show FlexReceiveTokenDomainFacet code', async function () {
      const { publicClient, flexReceiveTokenDomainFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexReceiveTokenDomainFacet.address });
      console.log(`FlexReceiveTokenDomainFacet code: ${code}`);
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

    it('Should show FlexReceiveTokenFacet function selectors', async function () {
      const { flexReceiveTokenFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveTokenFacet selectors:');
      for (const abi of flexReceiveTokenFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexReceiveTokenFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexReceiveTokenDomainFacet function selectors', async function () {
      const { flexReceiveTokenDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveTokenDomainFacet selectors:');
      for (const abi of flexReceiveTokenDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexReceiveTokenDomainFacet.abi, name: abi.name });
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
      console.log(`FlexReceiveStandalone code: ${code}`);
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

  it('Should receive token', async function () {
    const {
      flex,
      flexReceiveTokenFacet,
      flexReceiveTokenDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      walletClient,
      publicClient,
      resolver,
      token,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const amount = 123_456_789n;

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingFlexAmount = 2_496n;

    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        walletClient.account.address,
        amount + amount + remainingSenderAmount,
      ],
    });
    await walletClient.writeContract({
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
        flex.address,
        existingFlexAmount,
      ],
    });

    const receiveDomain = await publicClient.readContract({
      abi: flexReceiveTokenDomainFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveTokenDomain',
      args: [],
    });
    const receiveData0 = encodeFlexReceiveTokenData0({
      deadline,
      nonce,
      receiver,
    });
    const receiveData1 = encodeFlexReceiveTokenData1({
      amount,
    });
    const receiveData2 = encodeFlexReceiveTokenData2({
      token: token.address,
    });
    const receiveHash = calcFlexReceiveTokenHash({
      domain: receiveDomain,
      data0: receiveData0,
      data1: receiveData1,
      data2: receiveData2,
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

    const receiveComponentBranch = calcFlexReceiveTokenBranch({
      tree: orderTree,
      receiveTokenHash: receiveHash,
    });

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
        abi: flexReceiveTokenFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveToken',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
          receiveComponentBranch,
          receiverSignature,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveToken gas (1st): ${receipt.gasUsed}`);

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          flex.address,
        ],
      });
      expect(balance).equal(amount + existingFlexAmount);
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
        abi: flexReceiveTokenFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveToken',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
          receiveComponentBranch,
          receiverSignature,
        ],
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

      const newReceiveData0 = encodeFlexReceiveTokenData0({
        deadline,
        nonce: newNonce,
        receiver,
      });
      const newReceiveHash = calcFlexReceiveTokenHash({
        domain: receiveDomain,
        data0: newReceiveData0,
        data1: receiveData1,
        data2: receiveData2,
      });

      const newComponentHashes = [newReceiveHash, ...imaginaryComponentHashes];
      const newOrderTree = calcFlexTree({ leaves: newComponentHashes });
      const newOrderHash = calcFlexTreeHash({ tree: newOrderTree });

      const receiveComponentBranch = calcFlexReceiveTokenBranch({
        tree: newOrderTree,
        receiveTokenHash: newReceiveHash,
      });

      const hash = await walletClient.writeContract({
        abi: flexReceiveTokenFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveToken',
        args: [
          newReceiveData0,
          receiveData1,
          receiveData2,
          receiveComponentBranch,
          receiverSignature,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveToken gas (2nd): ${receipt.gasUsed}`);

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          flex.address,
        ],
      });
      expect(balance).equal(amount + amount + existingFlexAmount);

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
