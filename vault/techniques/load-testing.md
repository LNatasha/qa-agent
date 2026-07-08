---
type: technique
name: Load Testing
domains: [performance]
tags: [load, stress, spike, soak, performance]
---

Validates system behaviour under expected and peak load conditions, measuring throughput, latency, and error rates.

## When to use
Before any significant release, when scaling infrastructure, or when SLAs define latency/throughput targets.

## Strengths
- Surfaces capacity limits and bottlenecks before production
- Covers load (steady), stress (beyond limit), spike (sudden surge), and soak (sustained) patterns

## Tools
[[k6]]
