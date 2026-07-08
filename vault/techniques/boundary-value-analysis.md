---
type: technique
name: Boundary Value Analysis
domains: [web, api, mobile, performance]
tags: [bva, input-validation, equivalence]
---

Tests values at the edges of input ranges where defects cluster most densely.

## When to use
When a feature accepts numeric input, dates, string lengths, or any range-constrained value. Most effective for form validation, API parameter limits, and pagination logic.

## Strengths
- High defect-detection rate for off-by-one errors
- Deterministic: test cases are derived mechanically from the spec
- Pairs well with [[equivalence-partitioning]]

## Example test case pattern
For a field accepting 1–100: test 0, 1, 2, 99, 100, 101.

## Tools
[[postman]] · [[playwright]]

## Examples
[[playwright-login-test]]
