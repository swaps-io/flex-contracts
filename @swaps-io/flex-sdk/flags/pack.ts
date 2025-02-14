export type FlexFlagValue = boolean | undefined | null;

export function flexPackFlags(flags: readonly FlexFlagValue[], shift = 0): bigint {
  let value = 0n;
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) {
      value |= 1n << BigInt(i + shift);
    }
  }
  return value;
};
