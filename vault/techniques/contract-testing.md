---
type: technique
name: Contract Testing
domains: [api]
tags: [contract, consumer-driven, pact, integration]
---

Verifies that a service meets the expectations of its consumers without deploying the full system, by defining and validating a contract between consumer and provider.

## When to use
Microservice architectures, when integration tests are slow or flaky, or when teams own consumer and provider independently.

## Strengths
- Faster than full integration tests
- Catches breaking API changes before deployment
- Pairs with CI pipelines to block breaking changes automatically

## Tools
[[postman]]
