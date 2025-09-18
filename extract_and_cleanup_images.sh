#!/bin/bash
# filepath: extract_and_cleanup_images.sh

# Script to extract image paths from markdown and clean up unused images
# Usage: ./extract_and_cleanup_images.sh <markdown_file> <images_folder> [--dry-run]
# Example: ./extract_and_cleanup_images.sh ./src/content/posts/2025-08-20_Amiens_Treguier/2025-08-20_Amiens_Treguier_3.md ./src/content/posts/2025-08-20_Amiens_Treguier/images_3 --dry-run

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print usage
usage() {
    echo "Usage: $0 <markdown_file> <images_folder> [--dry-run]"
    echo "  markdown_file: Path to the markdown file to analyze"
    echo "  images_folder: Path to the folder containing images"
    echo "  --dry-run: Show what would be deleted without actually deleting"
    exit 1
}

# Check arguments
if [ $# -lt 2 ] || [ $# -gt 3 ]; then
    usage
fi

MARKDOWN_FILE="$1"
IMAGES_FOLDER="$2"
DRY_RUN=false

if [ $# -eq 3 ] && [ "$3" = "--dry-run" ]; then
    DRY_RUN=true
fi

# Check if files/folders exist
if [ ! -f "$MARKDOWN_FILE" ]; then
    echo -e "${RED}Error: Markdown file '$MARKDOWN_FILE' not found${NC}"
    exit 1
fi

if [ ! -d "$IMAGES_FOLDER" ]; then
    echo -e "${RED}Error: Images folder '$IMAGES_FOLDER' not found${NC}"
    exit 1
fi

echo -e "${GREEN}Analyzing markdown file: $MARKDOWN_FILE${NC}"
echo -e "${GREEN}Images folder: $IMAGES_FOLDER${NC}"

# Extract image paths from markdown
# This regex handles multiple image formats:
# - Standard markdown: ![alt](path)
# - HTML img tags: <img src="path">
# - Enhanced img (SvelteKit): <enhanced:img src={...} />
# - Your specific format: imageModules['./path']

extract_image_paths() {
    local md_file="$1"
    
    # Create temporary file for all found paths
    local temp_file=$(mktemp)
    
    # Extract standard markdown images: ![alt](path)
    grep -oE '!\[[^\]]*\]\([^)]+\)' "$md_file" | sed -E 's/!\[[^\]]*\]\(([^)]+)\)/\1/' >> "$temp_file" 2>/dev/null || true
    
    # Extract HTML img src: <img src="path">
    grep -oE '<img[^>]+src="[^"]+"' "$md_file" | sed -E 's/.*src="([^"]+)".*/\1/' >> "$temp_file" 2>/dev/null || true
    
    # Extract enhanced:img src: <enhanced:img ... src={...} />
    grep -oE '<enhanced:img[^>]+src=\{[^}]+\}' "$md_file" | sed -E 's/.*src=\{([^}]+)\}.*/\1/' >> "$temp_file" 2>/dev/null || true
    
    # Extract imageModules references: imageModules['./path']
    grep -oE "imageModules\['[^']+'\]" "$md_file" | sed -E "s/imageModules\['([^']+)'\]/\1/" >> "$temp_file" 2>/dev/null || true
    
    # Clean up paths (remove quotes, resolve relative paths)
    cat "$temp_file" | sed -E 's/^["'"'"']//; s/["'"'"']$//' | sort -u
    
    rm "$temp_file"
}

# Extract all image references
echo -e "${YELLOW}Extracting image references from markdown...${NC}"
USED_IMAGES=$(extract_image_paths "$MARKDOWN_FILE")

if [ -z "$USED_IMAGES" ]; then
    echo -e "${YELLOW}No image references found in markdown file${NC}"
else
    echo -e "${GREEN}Found image references:${NC}"
    echo "$USED_IMAGES" | while read -r img; do
        echo "  - $img"
    done
fi

echo ""

# Find all images in the folder
echo -e "${YELLOW}Finding all images in folder...${NC}"
ALL_IMAGES=$(find "$IMAGES_FOLDER" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" -o -iname "*.avif" -o -iname "*.svg" -o -iname "*.tiff" -o -iname "*.heif" \) | sort)

if [ -z "$ALL_IMAGES" ]; then
    echo -e "${YELLOW}No images found in folder${NC}"
    exit 0
fi

echo -e "${GREEN}Found $(echo "$ALL_IMAGES" | wc -l) images in folder${NC}"

# Find unused images
echo ""
echo -e "${YELLOW}Identifying unused images...${NC}"

UNUSED_IMAGES=""
while IFS= read -r img_path; do
    img_basename=$(basename "$img_path")
    img_relative_from_md=$(realpath --relative-to="$(dirname "$MARKDOWN_FILE")" "$img_path" 2>/dev/null || echo "$img_path")
    
    # Check if this image is referenced in the markdown
    found=false
    
    if [ -n "$USED_IMAGES" ]; then
        while IFS= read -r used_img; do
            # Clean the used image path
            used_img_clean=$(echo "$used_img" | sed 's/^\.\/*//')
            img_basename_clean=$(echo "$img_basename")
            img_relative_clean=$(echo "$img_relative_from_md" | sed 's/^\.\/*//')
            
            # Check various possible matches
            if [[ "$used_img" == *"$img_basename"* ]] || \
               [[ "$used_img_clean" == *"$img_basename_clean"* ]] || \
               [[ "$img_relative_clean" == *"$used_img_clean"* ]] || \
               [[ "$used_img" == "$img_path" ]] || \
               [[ "$used_img" == "$img_relative_from_md" ]]; then
                found=true
                break
            fi
        done <<< "$USED_IMAGES"
    fi
    
    if [ "$found" = false ]; then
        UNUSED_IMAGES="$UNUSED_IMAGES$img_path\n"
    fi
done <<< "$ALL_IMAGES"

# Remove trailing newline
UNUSED_IMAGES=$(echo -e "$UNUSED_IMAGES" | sed '/^$/d')

if [ -z "$UNUSED_IMAGES" ]; then
    echo -e "${GREEN}No unused images found! All images are referenced in the markdown.${NC}"
    exit 0
fi

echo -e "${RED}Found unused images:${NC}"
echo -e "$UNUSED_IMAGES" | while IFS= read -r img; do
    if [ -n "$img" ]; then
        echo "  - $img"
    fi
done

echo ""
unused_count=$(echo -e "$UNUSED_IMAGES" | grep -c .)
total_size=$(echo -e "$UNUSED_IMAGES" | xargs -I {} stat -f%z {} 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
human_size=$(numfmt --to=iec "$total_size" 2>/dev/null || echo "$total_size bytes")

echo -e "${YELLOW}Total unused images: $unused_count${NC}"
echo -e "${YELLOW}Total size: $human_size${NC}"

# Ask for confirmation unless dry-run
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN: No files were deleted${NC}"
    exit 0
fi

echo ""
read -p "Do you want to delete these unused images? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deleting unused images...${NC}"
    deleted_count=0
    
    echo -e "$UNUSED_IMAGES" | while IFS= read -r img; do
        if [ -n "$img" ] && [ -f "$img" ]; then
            if rm "$img"; then
                echo -e "${GREEN}Deleted: $img${NC}"
                ((deleted_count++))
            else
                echo -e "${RED}Failed to delete: $img${NC}"
            fi
        fi
    done
    
    echo -e "${GREEN}Cleanup completed!${NC}"
else
    echo -e "${YELLOW}No files were deleted${NC}"
fi