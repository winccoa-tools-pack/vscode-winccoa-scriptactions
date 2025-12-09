# Makefile for WinCC OA Script Actions Extension

# Directories
SRC_DIR := src
BIN_DIR := bin
DIST_DIR := dist
NODE_MODULES := node_modules

# Output
EXTENSION_NAME := winccoa-script-actions
VSIX_FILE := $(BIN_DIR)/$(EXTENSION_NAME).vsix

# Commands
NPM := npm
TSC := npx tsc
VSCE := npx vsce

# Default target
.PHONY: all
all: compile

# Install dependencies
.PHONY: install
install:
	@echo "Installing dependencies..."
	$(NPM) install

# Compile TypeScript
.PHONY: compile
compile: install
	@echo "Compiling TypeScript..."
	$(TSC) -p ./

# Build extension package
.PHONY: package
package: compile
	@echo "Creating bin directory..."
	@mkdir -p $(BIN_DIR)
	@echo "Packaging extension..."
	$(VSCE) package --out $(VSIX_FILE)
	@echo "Extension packaged: $(VSIX_FILE)"

# Watch mode for development
.PHONY: watch
watch: install
	@echo "Starting watch mode..."
	$(TSC) -watch -p ./

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(DIST_DIR)
	@echo "Clean complete."

# Clean everything including dependencies and bin
.PHONY: distclean
distclean: clean
	@echo "Removing node_modules and bin..."
	@rm -rf $(NODE_MODULES)
	@rm -rf $(BIN_DIR)
	@echo "Distclean complete."

# Lint TypeScript files
.PHONY: lint
lint: install
	@echo "Linting TypeScript files..."
	$(NPM) run lint

# Help target
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make install    - Install npm dependencies"
	@echo "  make compile    - Compile TypeScript to JavaScript (default)"
	@echo "  make package    - Build VSIX package in bin/"
	@echo "  make watch      - Watch and recompile on changes"
	@echo "  make lint       - Run ESLint"
	@echo "  make clean      - Remove dist directory"
	@echo "  make distclean  - Remove dist, node_modules, and bin"
	@echo "  make help       - Show this help message"
