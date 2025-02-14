import { viem } from 'hardhat';
import { ContractTypesMap } from 'hardhat/types';
import { getAbiItem, toFunctionSelector, toFunctionSignature } from 'viem';

export async function facetInfo(facet: ContractTypesMap[keyof ContractTypesMap]): Promise<void> {
  const publicClient = await viem.getPublicClient();

  const code = await publicClient.getCode({ address: facet.address });
  console.log(`    Code: ${code}`);

  console.log('    Selectors:');
  for (const abi of facet.abi) {
    if (abi.type === 'function') {
      const item = getAbiItem({ abi: facet.abi, name: abi.name });
      console.log(`    - ${toFunctionSelector(item)}: ${toFunctionSignature(item)}`);
    }
  }
}
