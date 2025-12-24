# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-12-24

### Added
- New command `winccoa.executeScriptWithArgs` for executing scripts with custom arguments
- Input dialog for entering script arguments (space-separated)
- Support for passing arguments to WCCOActrl (e.g., `arg1 arg2 arg3`)
- Command available via Command Palette: "WinCC OA: Start Script with Arguments"

### Changed
- Extended `buildExecutionCommand` to support optional arguments parameter
- Improved logging to show when scripts are executed with arguments

## [0.2.0] - TBD

### Added
- Automatic project detection mode via WinCC OA Core extension integration
- Extension dependency on `winccoa-tools-pack.winccoa-core` (optional)
- Automatic WinCC OA installation path and project name resolution in automatic mode
- Fallback to static configuration when Core extension is not available

### Changed
- `pathSource` setting now supports both `static` (manual configuration) and `automatic` (Core extension) modes
- Improved error handling when automatic mode is selected but Core extension is not installed

## [0.1.1] - 2025-12-14

### Added
- Structured logging system with ExtensionOutputChannel
- Configurable log levels: ERROR, WARN, INFO, DEBUG, TRACE
- Visual log level icons (❌ ⚠️ ℹ️ 🔍 🔬) in output channel
- Detailed logging for command execution and script actions
- Auto-show output channel on errors
- Timestamp and source information in log messages
- Enhanced Makefile with test-local target for local development
- Version counter system in local builds (test-local-XX format)

### Changed
- Replaced console logging with unified ExtensionOutputChannel (matching ctrllang extension)
- Updated log level setting to use uppercase values for consistency
- Improved error reporting with structured log messages
