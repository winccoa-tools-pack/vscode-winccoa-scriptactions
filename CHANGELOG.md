# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-01-18

### ✨ Added
- **GitHub Copilot Integration**: Registered Language Model Tool `winccoa_execute_script`
  - Enables AI assistants (GitHub Copilot) to autonomously execute CTL scripts
  - Simple interface: scriptPath + optional args + optional withEventConnection flag
  - Example: "Run script scripts/test.ctl with event connection"
- **LanguageModelToolsService**: New service for managing AI assistant tools
  - Automatic registration on extension activation
  - Proper disposal on deactivation
  - Detailed logging for debugging

### 🎯 Design Philosophy
- **Clear Responsibilities**: Script execution belongs to Script Actions Extension
  - MCP Server Extension: Server lifecycle management only
  - Script Actions Extension: Script execution + AI tool
  - CTL Language Extension: Language features + AI tool
  - LogViewer Extension: Log analysis + AI tool
- **Consistent Pattern**: Follows same architecture as CTL Language and LogViewer extensions

### 📝 Breaking Changes
- MAJOR version bump (1.x → 2.0.0) due to new AI integration feature
- No breaking changes to existing commands or API
- Backward compatible with existing workflows

## [1.1.2] - 2026-01-11

### Changed

- **CI Compatibility**: Added `test:unit` script alias for standardized CI/CD pipeline
  - `test:unit` → `npm test`
  - Ensures compatibility with Martin's CI/CD system

## [1.1.1] - 2026-01-08

### Changed

- **Event Connection by Default**: Script execution now uses Event Connection by default
- Removed `-n` flag from default commands for full WinCC OA runtime integration

### Known Limitations

- **TODO**: No UI option yet to run scripts without Event Connection (fast mode with `-n` flag)
- Will be implemented in a future version as a context menu option or setting

## [1.1.0] - 2026-01-04

### Added

- **Play Button**: Added green play icon (▶) to editor title bar for quick script execution
- Appears in context menu group for easy access
- Executes current script with WinCC OA Script Actions

## [Unreleased]

## [1.0.3] - 2026-01-01

### Changed

- **Extension Dependency**: Updated from `RichardJanisch.winccoa-control` to `RichardJanisch.winccoa-project-admin` (renamed in v1.0.4)

## [1.0.2] - 2025-12-30

### Fixed

- **Code References**: Updated extension ID references from `winccoa-tools-pack.winccoa-core` to `RichardJanisch.winccoa-control` in TypeScript code

## [1.0.1] - 2025-12-30

### Fixed

- **Extension Dependency**: Updated from `RichardJanisch.winccoa-core` to `RichardJanisch.winccoa-control` (package name changed in Control extension v1.0.1)

## [1.0.0] - 2025-12-29

### 🎉 First Stable Release

This is the first stable release of WinCC OA Script Actions extension.

### Added

- **Script Execution Modes**:
  - Execute scripts without event connection (default, `-n` flag for fast startup)
  - Execute scripts with event connection (for scripts that need event manager)
  - Execute scripts with custom arguments
  - Execute scripts with arguments AND event connection
- **Right-Click Menu**: Quick access to "Start Script" in Explorer and editor
- **Command Palette**: Four execution modes available via `Ctrl+Shift+P`
- **Cross-Platform**: Windows and Linux support
- **Integration**: WinCC OA Control extension support for automatic path detection

### Configuration

- `winccoa.scriptActions.pathSource`: Choose between `static` or `automatic` path detection
- `winccoa.scriptActions.installPath`: Manual WinCC OA installation path
- `winccoa.scriptActions.projectName`: Manual project name
- `winccoa.scriptActions.logLevel`: Configurable logging (ERROR, WARN, INFO, DEBUG, TRACE)

### Known Limitations

- Script output not captured in VS Code terminal (runs in background)
- Complex data structures not supported as arguments
- Automatic path detection requires WinCC OA Control extension

### Dependencies

- WinCC OA Control extension (RichardJanisch.winccoa-core) - optional, for automatic path detection

### Breaking Changes from 0.x

- Default execution mode now uses `-n` flag (no event connection) for performance
- Extension ID publisher changed to RichardJanisch
- Icon updated to unified WinCC OA Script Actions design

---

## [0.4.0] - 2025-12-28

### Added

- **-n Flag Support**: Scripts now run without event connection by default (faster startup, lighter weight)
- New command: `winccoa.executeScriptWithEventConnection` - Execute scripts WITH event manager connection
- New command: `winccoa.executeScriptWithArgsAndEventConnection` - Execute scripts with arguments AND event connection
- Enhanced logging shows whether script runs with or without event connection

### Changed

- **BREAKING**: Default behavior changed - `executeScript` and `executeScriptWithArgs` now use `-n` flag
- Right-click → "Start Script" executes with `-n` (no event connection) for performance
- Command Palette → "Start Script with Event Connection" for scripts that need events
- `buildExecutionCommand` now accepts `withEventConnection` parameter

### Performance

- Scripts start significantly faster without event manager overhead
- Reduced resource usage for scripts that don't need event connectivity

## [0.3.1] - 2025-12-25

### Fixed

- Fixed `executeScriptWithArgs` to pass arguments as plain strings without additional flags
- Arguments are now directly appended after `-proj` parameter for proper WCCOActrl execution
- Prepared for integration with Test Explorer extension for single test case execution

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
