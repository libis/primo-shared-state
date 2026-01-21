# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-14

### Added
- Initial release of @libis/primo-shared-state package
- Extracted state models from Primo host application
  - `search.model.ts`: Search parameters, documents, PNX data, delivery info
  - `user.model.ts`: User state, JWT, decoded JWT, user settings
  - `filter.model.ts`: Filter state, include/exclude filters
  - `state.const.ts`: Loading status and logout reason types
- Created state access services
  - `UserStateService`: Read/write user authentication and settings
  - `SearchStateService`: Read/write search results and metadata
  - `FilterStateService`: Read/write filter selections
- Utility classes
  - `StateHelper`: Base class for state operations
- Documentation
  - README.md: Complete API reference
  - QUICKSTART.md: Getting started guide
  - EXAMPLES.md: Code examples and patterns
  - PACKAGE_SUMMARY.md: Package overview
- Build configuration
  - TypeScript compilation to ES modules and CommonJS
  - Type definitions generation
  - NPM package configuration
- Module federation support
  - Singleton sharing configuration
  - Peer dependency management

### Features
- Observable-based state access with RxJS
- Promise-based snapshot methods for one-time reads
- Full TypeScript type safety
- Tree-shakeable ES modules
- Angular 16/17/18 compatibility
- NgRx Store 16/17/18 compatibility

## [Unreleased]

### Planned Features
- Additional state feature services (account, favorites, delivery)
- Helper methods for common state transformations
- State mocking utilities for testing
- Performance optimizations
- Additional examples and patterns

---

## Version History

- **1.0.0** - Initial release with core state models and services
