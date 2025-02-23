# Variables
PKG_NAME = luna-ipfs
LEVEL ?= patch  # Default version bump level (patch/minor/major)
DEBUG ?= false  # Enable debug mode (true/false)

# Debug flag
ifeq ($(DEBUG), true)
    VERBOSE_FLAG = --loglevel verbose
else
    VERBOSE_FLAG =
endif

# Show current version
.PHONY: version
version:
	@npm version --json | jq -r '.["$(PKG_NAME)"]'

# Install dependencies
.PHONY: install
install:
	@echo "Installing dependencies..."
	@npm install $(VERBOSE_FLAG)

# Run build process
.PHONY: build
build:
	@echo "Building package..."
	@npm run build $(VERBOSE_FLAG)

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	@npm test $(VERBOSE_FLAG)

# Clean up generated files
.PHONY: clean
clean:
	@echo "Cleaning up..."
	@rm -rf dist node_modules

# Create a new release
.PHONY: release
release:
	@echo "Checking Git status..."
	@git status
	@if ! git diff-index --quiet HEAD --; then \
		echo "❌ ERROR: Git working directory is not clean. Commit or stash changes before releasing."; \
		exit 1; \
	fi
	@echo "Bumping version ($(LEVEL))..."
	@npm version $(LEVEL) $(VERBOSE_FLAG)
	@git push --follow-tags
	@echo "Publishing to npm..."
	@npm publish $(VERBOSE_FLAG)
	@echo "Creating GitHub release..."
	@gh release create $(shell git describe --tags) --title "Release $(shell git describe --tags)" --notes "New release of $(PKG_NAME)"

# Help message
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install   - Install dependencies"
	@echo "  make build     - Build the package"
	@echo "  make test      - Run tests"
	@echo "  make clean     - Clean up generated files"
	@echo "  make version   - Show the current version"
	@echo "  make release   - Create a new release (level=patch/minor/major)"
	@echo "  make help      - Show this help message"
	@echo ""
	@echo "To enable debug mode, run: make release DEBUG=true"

