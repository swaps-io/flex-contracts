import { Hex, SimpleMerkleTree } from '../external';

export interface FlexTreeData {
  tree: Hex[],
  values: Record<Hex, number>,
}

export class FlexTree {
  public readonly inner: SimpleMerkleTree;

  public constructor(inner: SimpleMerkleTree) {
    this.inner = inner;
  }

  public dump(): FlexTreeData {
    const dump = this.inner.dump();
    const data: FlexTreeData = {
      tree: dump.tree as Hex[],
      values: Object.fromEntries(dump.values.map(({ value, treeIndex }) => [value, treeIndex])),
    };
    return data;
  }

  public static load(data: FlexTreeData): FlexTree {
    const dump = {
      format: 'simple-v1' as const,
      tree: data.tree,
      values: Object.entries(data.values).map(([value, treeIndex]) => ({ value, treeIndex })),
    };
    const inner = SimpleMerkleTree.load(dump);
    const tree = new FlexTree(inner);
    return tree;
  }
}
