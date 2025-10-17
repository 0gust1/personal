<script lang="ts">
	// Image module exposed by Sveltekit's enhanced:img plugin
	interface ImageModule {
		sources: {
			avif: string;
			webp: string;
			jpeg: string;
		};
		img: {
			src: string;
			w: number;
			h: number;
		};
	}

	interface ImageData {
		src: ImageModule;
		alt: string;
		title?: string;
		colSpan?: 1 | 2 | 3 | 4 | 5 | 6; // Number of columns to span (out of 6 internal columns)
		rowSpan?: 1 | 2 | 3; // Number of rows to span
		disableAutoPortrait?: boolean; // If true, disables automatic portrait handling
	}

	type ColumnCount = 1 | 2 | 3;
	type ColSpan = 1 | 2 | 3 | 4 | 5 | 6;
	type Orientation = 'portrait' | 'landscape' | 'square';

	let {
		images = [],
		columns = 2
	}: {
		images: ImageData[];
		columns?: ColumnCount;
	} = $props();

	const imageCount = $derived(images.length);

	// Map user-facing columns (1, 2, 3) to internal 6-column grid spans
	const COLUMN_SPAN_MAP: Record<ColumnCount, ColSpan> = {
		1: 6,
		2: 3,
		3: 2
	} as const;

	// Explicit class mappings for Tailwind JIT compiler
	const COL_SPAN_CLASSES: Record<ColSpan, string> = {
		1: 'col-span-1',
		2: 'col-span-2',
		3: 'col-span-3',
		4: 'col-span-4',
		5: 'col-span-5',
		6: 'col-span-6'
	} as const;

	const ROW_SPAN_CLASSES: Record<number, string> = {
		1: 'row-span-1',
		2: 'row-span-2',
		3: 'row-span-3'
	} as const;

	const defaultColSpan = $derived(COLUMN_SPAN_MAP[columns]);

	// Detect image orientation based on aspect ratio
	function getImageOrientation(image: ImageData): Orientation {
		const { w, h } = image.src.img;
		const ratio = w / h;

		if (ratio < 0.95) return 'portrait';
		if (ratio > 1.05) return 'landscape';
		return 'square';
	}

	// Generate CSS classes for each image (pure function)
	function getImageAttributes(
		totalImages: number,
		image: ImageData,
		defaultColSpan: number
	): { classes: string; sizes: string } {
		const orientation = getImageOrientation(image);
		const isAutoPortraitDisabled = image.disableAutoPortrait === true;

		// Determine actual column span
		const actualColSpan: ColSpan =
			image.colSpan ?? (totalImages === 1 ? 6 : (defaultColSpan as ColSpan));

		// Auto-apply rowSpan: 2 for portrait images unless explicitly set or disabled
		const actualRowSpan =
			image.rowSpan ??
			(orientation === 'portrait' && !isAutoPortraitDisabled ? 2 : 1);

		// Build CSS classes
		let classes = 'picture-item overflow-hidden cursor-pointer';

		// Apply aspect ratio (treat disabled auto-portrait like landscape)
		if (orientation === 'portrait' && !isAutoPortraitDisabled) {
			classes += ' aspect-portrait';
		} else if (orientation === 'landscape' || (orientation === 'portrait' && isAutoPortraitDisabled)) {
			classes += ' aspect-landscape';
		} else {
			classes += ' aspect-square';
		}

		// Apply column span using explicit class mapping
		classes += ` ${COL_SPAN_CLASSES[actualColSpan]}`;

		// Apply row span if greater than 1
		if (actualRowSpan > 1) {
			classes += ` ${ROW_SPAN_CLASSES[actualRowSpan]}`;
		}

		// Adjust sizes based on column span for optimal image loading (accounts for 2x DPR)
		const SIZE_MAP: Record<ColSpan, string> = {
			1: '(min-width: 1024px) 150px, 16vw',
			2: '(min-width: 1024px) 300px, 33vw',
			3: '(min-width: 1024px) 440px, 50vw',
			4: '(min-width: 1024px) 600px, 66vw',
			5: '(min-width: 1024px) 750px, 83vw',
			6: '(min-width: 1024px) 900px, 100vw'
		};

		const sizes = SIZE_MAP[actualColSpan];

		return { classes, sizes };
	}

	// Lightbox state
	let selectedImage = $state<ImageData | null>(null);
	let selectedIndex = $state(0);
	let dialogElement = $state<HTMLElement | null>(null);
	let isImageLoading = $state(false);

	function openLightbox(image: ImageData, index: number) {
		selectedImage = image;
		selectedIndex = index;
		isImageLoading = true;
		document.body.style.overflow = 'hidden';

		// Focus the dialog for keyboard navigation
		setTimeout(() => dialogElement?.focus(), 0);
	}

	function closeLightbox() {
		selectedImage = null;
		document.body.style.overflow = '';
	}

	function navigatePrevious() {
		if (selectedIndex > 0 && !isImageLoading) {
			isImageLoading = true;
			selectedIndex--;
			selectedImage = images[selectedIndex];
		}
	}

	function navigateNext() {
		if (selectedIndex < images.length - 1 && !isImageLoading) {
			isImageLoading = true;
			selectedIndex++;
			selectedImage = images[selectedIndex];
		}
	}

	function handleImageLoad() {
		isImageLoading = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!selectedImage) return;

		const keyHandlers: Record<string, () => void> = {
			Escape: closeLightbox,
			ArrowLeft: navigatePrevious,
			ArrowRight: navigateNext
		};

		const handler = keyHandlers[event.key];
		if (handler) handler();
	}
</script>

<!-- Keyboard event listener -->
<svelte:window onkeydown={handleKeydown} />

{#if images.length > 0}
	<div class="picture-grid grid gap-2 grid-cols-6 items-start mb-2">
		{#each images as image, index}
			{@const attrs = getImageAttributes(imageCount, image, defaultColSpan)}
			<div
				class={attrs.classes}
				onclick={() => openLightbox(image, index)}
				onkeydown={(e) => e.key === 'Enter' && openLightbox(image, index)}
				role="button"
				tabindex="0"
			>
				<enhanced:img
					src={image.src}
					alt={image.alt}
					title={image.title || image.alt}
					class="picture-image w-full h-full object-cover"
					loading="lazy"
					sizes={attrs.sizes}
				/>
			</div>
		{/each}
	</div>
{:else}
	<p class="text-gray-500 italic">PictureGrid requires at least 1 image</p>
{/if}

<!-- Lightbox Modal -->
{#if selectedImage}
	<div
		bind:this={dialogElement}
		class="lightbox-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
		onclick={closeLightbox}
		onkeydown={(e) => {
			if (e.key === 'Escape') closeLightbox();
		}}
		role="dialog"
		aria-modal="true"
		aria-label="Image lightbox"
		tabindex="-1"
	>
		<div class="relative w-full h-full flex items-center justify-center">
			<!-- Close button -->
			<button
				class="absolute top-2 right-2 md:top-4 md:right-4 text-white text-xl md:text-2xl hover:text-gray-300 z-10 bg-black/50 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center"
				onclick={(e) => {
					e.stopPropagation();
					closeLightbox();
				}}
				aria-label="Close lightbox"
			>
				×
			</button>

			<!-- Previous button -->
			{#if selectedIndex > 0}
				<button
					class="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl md:text-3xl hover:text-gray-300 z-10 bg-black/50 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-opacity"
					class:opacity-50={isImageLoading}
					class:cursor-not-allowed={isImageLoading}
					disabled={isImageLoading}
					onclick={(e) => {
						e.stopPropagation();
						navigatePrevious();
					}}
					aria-label="Previous image"
				>
					&larr;
				</button>
			{/if}

			<!-- Next button -->
			{#if selectedIndex < images.length - 1}
				<button
					class="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl md:text-3xl hover:text-gray-300 z-10 bg-black/50 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-opacity"
					class:opacity-50={isImageLoading}
					class:cursor-not-allowed={isImageLoading}
					disabled={isImageLoading}
					onclick={(e) => {
						e.stopPropagation();
						navigateNext();
					}}
					aria-label="Next image"
				>
					&rarr;
				</button>
			{/if}

			<!-- Image container with proper spacing for UI elements -->
			<div
				class="lightbox-image-container w-full h-full flex items-center justify-center pointer-events-none"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<!-- Loading spinner -->
				{#if isImageLoading}
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none"
					>
						<div
							class="spinner-delayed w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"
						></div>
					</div>
				{/if}

				<enhanced:img
					src={selectedImage.src}
					alt={selectedImage.alt}
					title={selectedImage.title || selectedImage.alt}
					class="max-w-full max-h-full object-contain pointer-events-none"
					style="max-width: min(1625px, calc(100vw - 4rem)); max-height: calc(100vh - 4rem);"
					sizes="(min-width: 1920px) 1800px, (min-width: 1280px) 1200px, (min-width: 768px) 90vw, 95vw"
					onload={handleImageLoad}
				/>
			</div>

			<div
				class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white text-center bg-black/50 px-2 py-1 rounded max-w-[80%] pointer-events-none"
			>
				{#if selectedImage.title}
					<p class="text-sm truncate text-gray-200 mt-1 mb-2">
						{selectedImage.title || selectedImage.alt}
					</p>
				{/if}

				<p class="text-xs text-gray-400 my-1">{selectedIndex + 1} / {images.length}</p>
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.picture-grid {
		@apply max-w-4xl mx-auto;
		/* Overflow container on medium and large screens */
		@apply md:max-w-none md:w-[calc(100%+8rem)] md:-mx-16;
		@apply lg:w-[calc(100%+12rem)] lg:-mx-24;
	}

	/* Picture items maintain consistent aspect ratio containers */
	.picture-item {
		@apply relative h-full w-full;
	}

	/* Aspect ratio classes based on image orientation */
	.aspect-portrait {
		@apply aspect-[3/4];
	}

	.aspect-landscape {
		@apply aspect-[4/3];
	}

	.aspect-square {
		@apply aspect-[1/1];
	}

	/* Images fill their containers with object-cover for cropping */
	.picture-image {
		@apply absolute inset-0;
		/* Default: crop portraits, maintain landscapes */
		object-position: center;
		/* Smooth transition for hover effects */
		transition:
			filter 0.1s ease-out,
			transform 0.1s ease-out;
	}

	/* Elegant hover effect: subtle brightness and slight scale */
	.picture-item:hover .picture-image,
	.picture-item:focus .picture-image {
		filter: contrast(1.05) brightness(1.1) saturate(1.1);
		/* transform: scale(1.01); */
	}

	/* Lightbox styles */
	.lightbox-overlay {
		backdrop-filter: blur(2px);
		animation: fadeIn 0.2s ease-out;
	}

	.lightbox-image-container {
		animation: scaleIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Ensure buttons are accessible */
	button:focus {
		outline: 2px solid white;
		outline-offset: 2px;
	}

	/* Delayed spinner - only shows after 200ms to avoid flash on instant loads */
	.spinner-delayed {
		opacity: 0;
		animation:
			fadeInSpinner 0.1s ease-out 0.2s forwards,
			spin 0.6s linear 0.2s infinite;
	}

	@keyframes fadeInSpinner {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
