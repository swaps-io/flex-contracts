# Flex Contracts

### Domain

_Domain_ is a `bytes32` value that uniquely identifies context within which a
[component](#component) data is expected to be used. The usage context consists
of:

- _chain_ - can be identified with chain ID (EVM or manually assigned) or name
- _contract_ - can be identified in the chain with contract address
- _function_ - can be identified in the contract with function selector
- _version_ - can be identified with implementation iteration index

There is no exact algorithm on how to compute `bytes32` domain from these
values. However, the output _must_ reflect the original values, i.e. there is
_no_ two _usable_ sets of input values that produce the same output domain.

_Examples_ of possible domain computation approaches:

- encode all values data into the domain value
- apply `keccak256` to concatenated value bytes
- assign each domain using global incremental counter

Note that domains are passed to _facet_ constructors and stored as _immutables_.
This means domains cannot be initialized _later_ by each diamond they are used
by. Instead, these facets are deployed for usage by a _specific_ diamond in mind
and _should not_ be used with other diamonds. That's because a new diamond will
have a different contract address - which is a part of domain.

> [!WARNING]
>
> _Re-using same domain in multiple active contracts poses security risks!_
>
> Imagine there is a `Facet-A` deployed with `Domain-A` and used by `Diamond-A`.
> User approves asset to `Diamond-A` and signs order with component that has
> `Domain-A`. Signature is accepted by `Diamond-A`, asset action is performed.
>
> Then there is `Diamond-B` deployed with _old_ `Facet-A`. User approves asset
> to `Diamond-B` and signs order with component that has `Domain-A`. Signature
> is accepted by `Diamond-B`, asset action is performed.
>
> Notice that the signature for `Diamond-B` is _also_ valid to be used by
> `Diamond-A` due to the _domain re-use_ issue. If user forgets to revoke asset
> allowance for `Diamond-A` before switching to `Diamond-B`, an additional
> undesired asset action can be performed.

### Component
