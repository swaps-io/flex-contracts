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
  calcFlexReceiveTokenFromBranch,
  calcFlexReceiveTokenFromHash,
  calcFlexTree,
  calcFlexTreeHash,
  encodeFlexReceiveTokenFromData0,
  encodeFlexReceiveTokenFromData1,
  encodeFlexReceiveTokenFromData2,
  encodeFlexReceiveTokenFromData3,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexReceiveTokenFromFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [senderClient, walletClient] = await viem.getWalletClients();

    const flexReceiveTokenFromDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff'; // For standalone
    const flexReceiveTokenFromFromDomain = '0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0';
    const flexConfirmTokenDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // For standalone
    const flexRefundTokenDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e'; // For standalone

    let flex: { address: Address };
    let flexReceiveTokenFromFacet: ContractTypesMap['FlexReceiveTokenFromFacet'];
    let flexReceiveTokenFromDomainFacet: ContractTypesMap['FlexReceiveTokenFromDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveTokenFromFacet = await viem.deployContract('FlexReceiveTokenFromFacet', [flexReceiveTokenFromDomain]);
      flexReceiveTokenFromDomainFacet = await viem.deployContract('FlexReceiveTokenFromDomainFacet', [flexReceiveTokenFromDomain]);
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
              facetAddress: flexReceiveTokenFromFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveTokenFromFacet.abi,
                    name: 'flexReceiveTokenFrom',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveTokenFromDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveTokenFromDomainFacet.abi,
                    name: 'flexReceiveTokenFromDomain',
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
          flexReceiveTokenFromDomain,
          flexReceiveTokenFromFromDomain,
          flexConfirmTokenDomain,
          flexRefundTokenDomain,
        ],
      );

      flexReceiveTokenFromFacet = flex as ContractTypesMap['FlexReceiveTokenFromFacet'];
      flexReceiveTokenFromDomainFacet = flex as ContractTypesMap['FlexReceiveTokenFromDomainFacet'];
      flexReceiveStateFacet = flex as ContractTypesMap['FlexReceiveStateFacet'];
      flexReceiveHashFacet = flex as ContractTypesMap['FlexReceiveHashFacet'];
    }

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      senderClient,
      walletClient,
      resolver,
      flex,
      flexReceiveTokenFromFacet,
      flexReceiveTokenFromDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      token,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexReceiveTokenFromFacet code', async function () {
      const { publicClient, flexReceiveTokenFromFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexReceiveTokenFromFacet.address });
      console.log(`FlexReceiveTokenFromFacet code: ${code}`);
    });

    it('Should show FlexReceiveTokenFromDomainFacet code', async function () {
      const { publicClient, flexReceiveTokenFromDomainFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexReceiveTokenFromDomainFacet.address });
      console.log(`FlexReceiveTokenFromDomainFacet code: ${code}`);
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

    it('Should show FlexReceiveTokenFromFacet function selectors', async function () {
      const { flexReceiveTokenFromFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveTokenFromFacet selectors:');
      for (const abi of flexReceiveTokenFromFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexReceiveTokenFromFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexReceiveTokenFromDomainFacet function selectors', async function () {
      const { flexReceiveTokenFromDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexReceiveTokenFromDomainFacet selectors:');
      for (const abi of flexReceiveTokenFromDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexReceiveTokenFromDomainFacet.abi, name: abi.name });
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
      flexReceiveTokenFromFacet,
      flexReceiveTokenFromDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      senderClient,
      walletClient,
      publicClient,
      resolver,
      token,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address; // + walletClient
    const amount = 123_456_789n;
    const sender = senderClient.account.address;

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingFlexAmount = 2_496n;

    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        sender,
        amount + amount + remainingSenderAmount,
      ],
    });
    await senderClient.writeContract({
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
      abi: flexReceiveTokenFromDomainFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveTokenFromDomain',
      args: [],
    });
    const receiveData0 = encodeFlexReceiveTokenFromData0({
      deadline,
      nonce,
      receiver,
    });
    const receiveData1 = encodeFlexReceiveTokenFromData1({
      amount,
    });
    const receiveData2 = encodeFlexReceiveTokenFromData2({
      token: token.address,
    });
    const receiveData3 = encodeFlexReceiveTokenFromData3({
      sender,
    });
    const receiveHash = calcFlexReceiveTokenFromHash({
      domain: receiveDomain,
      data0: receiveData0,
      data1: receiveData1,
      data2: receiveData2,
      data3: receiveData3,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveHash, ...imaginaryComponentHashes];
    const orderTree = calcFlexTree({ leaves: componentHashes });
    const orderHash = calcFlexTreeHash({ tree: orderTree });

    const senderSignature = await senderClient.signMessage({ message: { raw: orderHash } });

    const receiveComponentBranch = calcFlexReceiveTokenFromBranch({
      tree: orderTree,
      receiveTokenFromHash: receiveHash,
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
        abi: flexReceiveTokenFromFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveTokenFrom',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
          receiveData3,
          receiveComponentBranch,
          senderSignature,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveTokenFrom gas (1st): ${receipt.gasUsed}`);

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
        abi: flexReceiveTokenFromFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveTokenFrom',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
          receiveData3,
          receiveComponentBranch,
          senderSignature,
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

      const newReceiveData0 = encodeFlexReceiveTokenFromData0({
        deadline,
        nonce: newNonce,
        receiver,
      });
      const newReceiveHash = calcFlexReceiveTokenFromHash({
        domain: receiveDomain,
        data0: newReceiveData0,
        data1: receiveData1,
        data2: receiveData2,
        data3: receiveData3,
      });

      const newComponentHashes = [newReceiveHash, ...imaginaryComponentHashes];
      const newOrderTree = calcFlexTree({ leaves: newComponentHashes });
      const newOrderHash = calcFlexTreeHash({ tree: newOrderTree });

      const newSenderSignature = await senderClient.signMessage({ message: { raw: newOrderHash } });

      const receiveComponentBranch = calcFlexReceiveTokenFromBranch({
        tree: newOrderTree,
        receiveTokenFromHash: newReceiveHash,
      });

      const hash = await walletClient.writeContract({
        abi: flexReceiveTokenFromFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveTokenFrom',
        args: [
          newReceiveData0,
          receiveData1,
          receiveData2,
          receiveData3,
          receiveComponentBranch,
          newSenderSignature,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveTokenFrom gas (2nd): ${receipt.gasUsed}`);

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
