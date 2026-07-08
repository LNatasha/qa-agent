---
type: tool
name: Playwright
domains: [web, api]
language: [typescript, python, java, csharp]
tags: [e2e, cross-browser, headless, network-interception]
---

Microsoft's browser automation framework supporting Chromium, Firefox, and WebKit. Includes built-in network interception, auto-waiting, and a full TypeScript-first API.

## Strengths
- Auto-waiting eliminates flaky explicit waits
- Network interception for API mocking within E2E tests
- Native TypeScript support with full type safety
- Parallel test execution out of the box

## When to prefer over alternatives
Choose Playwright over Selenium for new projects — faster, more reliable, better TypeScript support. Choose over Cypress when you need cross-browser coverage or Firefox/WebKit.

## Related techniques
[[boundary-value-analysis]] · [[equivalence-partitioning]]

## Examples
[[playwright-login-test]]
