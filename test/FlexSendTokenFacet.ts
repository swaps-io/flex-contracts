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
  calcFlexSendTokenBranch,
  calcFlexSendTokenHash,
  calcFlexTree,
  calcFlexTreeHash,
  encodeFlexSendTokenData0,
  encodeFlexSendTokenData1,
  encodeFlexSendTokenData2,
  encodeFlexSendTokenData3,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexSendTokenFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, resolverClient] = await viem.getWalletClients();

    const flexSendNativeDomain = '0xabababababababababababababababababababababababababababababababab'; // For standalone
    const flexSendTokenDomain = '0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd';

    let flex: { address: Address };
    let flexSendTokenFacet: ContractTypesMap['FlexSendTokenFacet'];
    let flexSendTokenDomainFacet: ContractTypesMap['FlexSendTokenDomainFacet'];
    let flexSendTimeFacet: ContractTypesMap['FlexSendTimeFacet'];
    let flexSendHashFacet: ContractTypesMap['FlexSendHashFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexSendTokenFacet = await viem.deployContract('FlexSendTokenFacet', [flexSendTokenDomain]);
      flexSendTokenDomainFacet = await viem.deployContract('FlexSendTokenDomainFacet', [flexSendTokenDomain]);
      flexSendTimeFacet = await viem.deployContract('FlexSendTimeFacet');
      flexSendHashFacet = await viem.deployContract('FlexSendHashFacet');

      flex = await viem.deployContract('Diamond', [walletClient.account.address, diamondCutFacet.address]);
      await walletClient.writeContract({
        abi: diamondCutFacet.abi,
        address: flex.address,
        functionName: 'diamondCut',
        args: [
          [
            {
              action: 0, // Add
              facetAddress: flexSendTokenFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendTokenFacet.abi,
                    name: 'flexSendToken',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexSendTokenDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendTokenDomainFacet.abi,
                    name: 'flexSendTokenDomain',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexSendTimeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendTimeFacet.abi,
                    name: 'flexSendTime',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexSendHashFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendHashFacet.abi,
                    name: 'flexSendHash',
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
        'FlexSendStandalone',
        [
          flexSendNativeDomain,
          flexSendTokenDomain,
        ],
      );

      flexSendTokenFacet = flex as ContractTypesMap['FlexSendTokenFacet'];
      flexSendTokenDomainFacet = flex as ContractTypesMap['FlexSendTokenDomainFacet'];
      flexSendTimeFacet = flex as ContractTypesMap['FlexSendTimeFacet'];
      flexSendHashFacet = flex as ContractTypesMap['FlexSendHashFacet'];
    }

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      resolverClient,
      flex,
      flexSendTokenFacet,
      flexSendTokenDomainFacet,
      flexSendTimeFacet,
      flexSendHashFacet,
      token,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexSendTokenFacet code', async function () {
      const { publicClient, flexSendTokenFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexSendTokenFacet.address });
      console.log(`FlexSendTokenFacet code: ${code}`);
    });

    it('Should show FlexSendTokenDomainFacet code', async function () {
      const { publicClient, flexSendTokenDomainFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexSendTokenDomainFacet.address });
      console.log(`FlexSendTokenDomainFacet code: ${code}`);
    });

    it('Should show FlexSendTimeFacet code', async function () {
      const { publicClient, flexSendTimeFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexSendTimeFacet.address });
      console.log(`FlexSendTimeFacet code: ${code}`);
    });

    it('Should show FlexSendHashFacet code', async function () {
      const { publicClient, flexSendHashFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexSendHashFacet.address });
      console.log(`FlexSendHashFacet code: ${code}`);
    });

    it('Should show FlexSendTokenFacet function selectors', async function () {
      const { flexSendTokenFacet } = await loadFixture(deployFixture);

      console.log('FlexSendTokenFacet selectors:');
      for (const abi of flexSendTokenFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexSendTokenFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexSendTokenDomainFacet function selectors', async function () {
      const { flexSendTokenDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexSendTokenDomainFacet selectors:');
      for (const abi of flexSendTokenDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexSendTokenDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

    it('Should show FlexSendTimeFacet function selectors', async function () {
      const { flexSendTimeFacet } = await loadFixture(deployFixture);

      console.log('FlexSendTimeFacet selectors:');
      for (const abi of flexSendTimeFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexSendTimeFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

    it('Should show FlexSendHashFacet function selectors', async function () {
      const { flexSendHashFacet } = await loadFixture(deployFixture);

      console.log('FlexSendHashFacet selectors:');
      for (const abi of flexSendHashFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexSendHashFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  } else {
  //

    it('Should show FlexSendStandalone code', async function () {
      const { publicClient, flex } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flex.address });
      console.log(`FlexSendStandalone code: ${code}`);
    });

    it('Should show FlexSendStandalone function selectors', async function () {
      const { flexSendHashFacet } = await loadFixture(deployFixture);

      console.log('FlexSendStandalone selectors:');
      for (const abi of flexSendHashFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexSendHashFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should send token', async function () {
    const {
      flex,
      flexSendTokenFacet,
      flexSendTokenDomainFacet,
      flexSendTimeFacet,
      flexSendHashFacet,
      walletClient,
      resolverClient,
      publicClient,
      token,
    } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_000_000_000n;
    const nonce = 424_242n;
    const group = 0;
    const sender = resolverClient.account.address;
    const receiver = walletClient.account.address;
    const amount = 123_456_789n;

    const remainingAmount = 111_222n;
    const remainingAllowance = 55_777n;

    await resolverClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        resolverClient.account.address,
        amount + amount + remainingAmount,
      ],
    });
    await resolverClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'approve',
      args: [
        flex.address,
        amount + amount + remainingAllowance,
      ],
    });

    const sendDomain = await publicClient.readContract({
      abi: flexSendTokenDomainFacet.abi,
      address: flex.address,
      functionName: 'flexSendTokenDomain',
      args: [],
    });
    const sendData0 = encodeFlexSendTokenData0({
      start,
      duration,
      sender,
    });
    const sendData1 = encodeFlexSendTokenData1({
      group,
      nonce,
      receiver,
    });
    const sendData2 = encodeFlexSendTokenData2({
      amount,
    });
    const sendData3 = encodeFlexSendTokenData3({
      token: token.address,
    });
    const sendHash = calcFlexSendTokenHash({
      domain: sendDomain,
      data0: sendData0,
      data1: sendData1,
      data2: sendData2,
      data3: sendData3,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [sendHash, ...imaginaryComponentHashes];
    const orderTree = calcFlexTree({ leaves: componentHashes });
    const orderHash = calcFlexTreeHash({ tree: orderTree });

    const sendComponentBranch = calcFlexSendTokenBranch({
      tree: orderTree,
      sendTokenHash: sendHash,
    });

    let expectedSendHash: Hex;
    {
      const time = await publicClient.readContract({
        abi: flexSendTimeFacet.abi,
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
        abi: flexSendHashFacet.abi,
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
        abi: flexSendTokenFacet.abi,
        address: flex.address,
        functionName: 'flexSendToken',
        args: [
          sendData0,
          sendData1,
          sendData2,
          sendData3,
          sendComponentBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendToken gas (1st): ${receipt.gasUsed}`);

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
        abi: flexSendTimeFacet.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(start);

      expectedSendHash = sliceHex(keccak256(concat([expectedSendHash, orderHash])), 0, 20);

      const hash = await publicClient.readContract({
        abi: flexSendHashFacet.abi,
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
      const sendData0 = encodeFlexSendTokenData0({
        start: start - 1, // Note - bad start
        duration,
        sender,
      });
      const sendHash = calcFlexSendTokenHash({
        domain: sendDomain,
        data0: sendData0,
        data1: sendData1,
        data2: sendData2,
        data3: sendData3,
      });
  
      const componentHashes = [sendHash, ...imaginaryComponentHashes];
      const orderTree = calcFlexTree({ leaves: componentHashes });

      const sendComponentBranch = calcFlexSendTokenBranch({
        tree: orderTree,
        sendTokenHash: sendHash,
      });

      await expect(
        resolverClient.writeContract({
          abi: flexSendTokenFacet.abi,
          address: flex.address,
          functionName: 'flexSendToken',
          args: [
            sendData0,
            sendData1,
            sendData2,
            sendData3,
            sendComponentBranch,
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

      const sendData0 = encodeFlexSendTokenData0({
        start: start + 1, // Note - new start
        duration,
        sender,
      });
      const sendHash = calcFlexSendTokenHash({
        domain: sendDomain,
        data0: sendData0,
        data1: sendData1,
        data2: sendData2,
        data3: sendData3,
      });
  
      const componentHashes = [sendHash, ...imaginaryComponentHashes];
      const orderTree = calcFlexTree({ leaves: componentHashes });
      newOrderHash = calcFlexTreeHash({ tree: orderTree });

      const sendComponentBranch = calcFlexSendTokenBranch({
        tree: orderTree,
        sendTokenHash: sendHash,
      });

      const hash = await resolverClient.writeContract({
        abi: flexSendTokenFacet.abi,
        address: flex.address,
        functionName: 'flexSendToken',
        args: [
          sendData0,
          sendData1,
          sendData2,
          sendData3,
          sendComponentBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendToken gas (2nd): ${receipt.gasUsed}`);

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
        abi: flexSendTimeFacet.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(start + 1);

      expectedSendHash = sliceHex(keccak256(concat([expectedSendHash, newOrderHash])), 0, 20);

      const hash = await publicClient.readContract({
        abi: flexSendHashFacet.abi,
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
