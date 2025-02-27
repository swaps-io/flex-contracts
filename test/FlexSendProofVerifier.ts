import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { viem } from 'hardhat';
import { zeroAddress, zeroHash } from 'viem';
import { expect } from 'chai';

describe('FlexSendProofVerifier', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const verifier = await viem.deployContract('FlexSendProofVerifier', [flex.address]);

    const testChainId = BigInt(await publicClient.getChainId());

    return {
      publicClient,
      walletClient,
      flex,
      verifier,
      testChainId,
    };
  }

  it('Should not verify proof with wrong chain', async function () {
    const { verifier } = await loadFixture(deployFixture);

    const sig = zeroHash;
    const hash = zeroHash;
    const chain = 1234567890n;
    const proof = '0x';

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofChainError()',
    );
  });

  it('Should not verify proof with unsupported event signature', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const sig = zeroHash;
    const hash = zeroHash;
    const chain = testChainId;
    const proof = '0x';

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofEventError()',
    );
  });
});
