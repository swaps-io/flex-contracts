import { viem } from 'hardhat';
import { zeroAddress } from 'viem';

describe('FlexSendNativeDomainFacet', function () {
  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexSendNativeDomainFacet', [zeroAddress]));
  });
});
