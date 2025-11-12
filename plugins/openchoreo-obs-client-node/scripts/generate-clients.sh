#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"
OPENAPI_DIR="$PLUGIN_DIR/openapi"
SRC_DIR="$PLUGIN_DIR/src"
GENERATED_DIR="$SRC_DIR/generated"

echo -e "${BLUE}🔧 OpenChoreo Observability API Client Generator${NC}"
echo ""

# Parse command line arguments
OPENCHOREO_VERSION=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --openchoreo-version)
      OPENCHOREO_VERSION="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}❌ Unknown argument: $1${NC}"
      echo "Usage: $0 [--openchoreo-version v0.1.0]"
      exit 1
      ;;
  esac
done

# If no version provided via CLI, read from package.json
if [ -z "$OPENCHOREO_VERSION" ]; then
  echo -e "${YELLOW}📋 Reading OpenChoreo version from package.json...${NC}"

  # Check if node is available
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not found${NC}"
    exit 1
  fi

  # Read openchoreoVersion from package.json
  OPENCHOREO_VERSION=$(node -pe "require('$PLUGIN_DIR/package.json').openchoreoVersion || ''" 2>/dev/null)

  if [ -z "$OPENCHOREO_VERSION" ]; then
    echo -e "${RED}❌ openchoreoVersion not found in package.json${NC}"
    echo "Please add 'openchoreoVersion' field to package.json or provide --openchoreo-version argument"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Using OpenChoreo version: ${OPENCHOREO_VERSION}${NC}"

# Validate version format (should be vX.Y.Z)
if [[ ! "$OPENCHOREO_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+.*$ ]]; then
  echo -e "${YELLOW}⚠️  Warning: Version format should be vX.Y.Z (e.g., v0.1.0)${NC}"
fi

# Create directories
echo ""
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p "$OPENAPI_DIR"
mkdir -p "$GENERATED_DIR/observability"

# Download OpenAPI specs
echo ""
echo -e "${YELLOW}⬇️  Downloading OpenAPI specifications...${NC}"

OBSERVABILITY_SPEC_URL="https://raw.githubusercontent.com/openchoreo/openchoreo/refs/tags/${OPENCHOREO_VERSION}/cmd/observer/openapi.yaml"

echo -e "   Observability API:  ${OBSERVABILITY_SPEC_URL}"

# Download observability.yaml
if curl -fsSL "$OBSERVABILITY_SPEC_URL" -o "$OPENAPI_DIR/observability.yaml"; then
  echo -e "${GREEN}✓ Downloaded observability.yaml${NC}"
else
  echo -e "${RED}❌ Failed to download observability.yaml${NC}"
  echo "Please check if the version ${OPENCHOREO_VERSION} exists in the OpenChoreo repository"
  exit 1
fi

# Generate version.ts file
echo ""
echo -e "${YELLOW}📝 Generating version.ts...${NC}"
cat > "$SRC_DIR/version.ts" << EOF
/**
 * OpenChoreo Observability API Version
 * Auto-generated from package.json openchoreoVersion field
 * DO NOT EDIT MANUALLY
 *
 * @packageDocumentation
 */

export const OPENCHOREO_VERSION = '${OPENCHOREO_VERSION}';
EOF
echo -e "${GREEN}✓ Generated version.ts${NC}"

# Check if openapi-typescript is available
echo ""
echo -e "${YELLOW}🔨 Generating TypeScript types from OpenAPI specs...${NC}"

# Generate Observability API types
echo -e "   Generating Observability API types..."
npx openapi-typescript "$OPENAPI_DIR/observability.yaml" -o "$GENERATED_DIR/observability/types.ts"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Observability API types generated successfully${NC}"
else
  echo -e "${RED}❌ Failed to generate Observability API types${NC}"
  exit 1
fi

# Create index files for each API
echo ""
echo -e "${YELLOW}📝 Creating index files...${NC}"

# Observability API index
cat > "$GENERATED_DIR/observability/index.ts" << 'EOF'
/**
 * OpenChoreo Observability API Client
 * Auto-generated TypeScript types from OpenAPI spec
 *
 * @packageDocumentation
 */

export * from './types';
EOF

echo -e "${GREEN}✓ Index files created${NC}"

# Summary
echo ""
echo -e "${GREEN}✅ API client generation completed successfully!${NC}"
echo ""
echo -e "${BLUE}📦 Generated clients:${NC}"
echo -e "   Observability API:  ${GENERATED_DIR}/observability"
echo -e "   Version:   ${SRC_DIR}/version.ts"
echo ""
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   1. Review generated clients in src/generated/"
echo -e "   2. Run 'yarn build' to compile the package"
echo -e "   3. Import and use the clients in your code"
echo ""
