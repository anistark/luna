# Define variables
PKG_NAME = luna-ipfs
NPM_REGISTRY = https://registry.npmjs.org/
VERSION = $(shell node -p "require('./package.json').version")
GITHUB_REPO = anistark/luna-ipfs

# Default target
.PHONY: all
all: build

# Install dependencies
.PHONY: install
install:
	npm install

# Build the package
.PHONY: build
build:
	rm -rf dist
	npm run build

# Run tests
.PHONY: test
test:
	npm run test

# Lint the code
.PHONY: lint
lint:
	npm run lint

# Bump the version (patch, minor, major)
.PHONY: version
version:
	@echo "Usage: make version level=patch|minor|major"
	npm version $(level)

# Publish to npm
.PHONY: publish
publish: build test
	npm publish --access public

# Create a GitHub release linked to the npm version
.PHONY: github-release
github-release:
	@echo "Creating GitHub Release for v$(VERSION)..."
	git tag v$(VERSION)
	git push origin v$(VERSION)
	gh release create v$(VERSION) --title "Release v$(VERSION)" --notes "New version v$(VERSION) published to npm 🚀. View it here: [npm $(PKG_NAME)](https://www.npmjs.com/package/$(PKG_NAME))"

# Clean build files
.PHONY: clean
clean:
	rm -rf node_modules dist package-lock.json

# Reinstall dependencies
.PHONY: reinstall
reinstall: clean install

# Release workflow (bump version, build, test, publish, GitHub release)
.PHONY: release
release:
	@echo "Usage: make release level=patch|minor|major"
	npm version $(level)
	$(MAKE) publish
	$(MAKE) github-release

# Run example usage script
.PHONY: example
example:
	npx ts-node examples/upload-example.ts
