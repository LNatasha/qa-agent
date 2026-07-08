---
type: tool
name: Detox
domains: [mobile]
language: [typescript, javascript]
tags: [mobile, react-native, grey-box, e2e, ios, android]
---

Grey-box E2E testing framework for React Native apps. Runs on real devices and simulators. Unlike black-box tools, Detox can synchronize with the React Native bridge for reliable, fast tests.

## Strengths
- No manual sleep/wait — synchronizes automatically with app activity
- Significantly faster and less flaky than [[appium]] for React Native
- First-class TypeScript support
- Works in CI with iOS Simulator and Android Emulator

## When to prefer over Appium
Use Detox whenever the app is React Native. Use [[appium]] for native Swift/Kotlin or cross-platform coverage beyond React Native.

## Related techniques
[[exploratory-testing]]
