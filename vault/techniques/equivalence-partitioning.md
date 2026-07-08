---
type: technique
name: Equivalence Partitioning
domains: [web, api, mobile, performance]
tags: [ep, input-validation, partition]
---

Divides inputs into classes where all values in a class are expected to behave identically, then tests one representative value per class.

## When to use
Any feature with discrete input categories: user roles, payment methods, file types, response codes.

## Strengths
- Reduces redundant tests without losing coverage
- Works at any layer: UI, API, unit
- Combines naturally with [[boundary-value-analysis]]

## Tools
[[postman]] · [[playwright]] · [[appium]]
