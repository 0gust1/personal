<script lang="ts">
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
	}

	let { images = $bindable([]) }: { images: ImageData[] } = $props();

	// Validate image count using derived runes
	//const images = $derived(images.slice(0, 6)); // Max 6 images
	const imageCount = $derived(images.length);

	// Grid layout classes based on image count
	const gridClass = $derived(
		{
			1: 'grid-cols-1',
			2: 'grid-cols-2',
			3: 'odd-image-grid', // Custom grid for 3 images
			4: 'grid-cols-2',
			5: 'odd-image-grid', // Custom grid for 5 images
			6: 'grid-cols-3'
		}[imageCount] || 'grid-cols-3'
	);

	// Generate CSS classes for each image (pure function)
	function getImageAttributes(
		index: number,
		totalImages: number
	): { classes: string; sizes: string } {
		let classes = 'picture-item overflow-hidden cursor-pointer';
		// Account for max 2x DPR on high-res displays
		// Regular images: actual size ~419px, so cap at 800px to handle 2x DPR
		let sizes = '(min-width: 1024px) 440px, 50vw';

		// For full-width spanning images: actual size ~848px, cap at 1600px for 2x DPR
		if (
			(totalImages === 3 && index === 2) ||
			(totalImages === 5 && index === 4) ||
			totalImages === 1
		) {
			classes += ' col-span-2';
			sizes = '(min-width: 1024px) 900px, 100vw';
		}

		if ((totalImages === 7 && index === 6))
		{
			classes += ' col-span-3';
			sizes = '(min-width: 1024px) 900px, 100vw';
		}

		return { classes, sizes };
	}

	// Lightbox state using runes
	let selectedImage = $state<ImageData | null>(null);
	let selectedIndex = $state(0);
	let dialogElement = $state<HTMLElement | null>(null);
	let isImageLoading = $state(false);

	function openLightbox(image: ImageData, index: number) {
		selectedImage = image;
		selectedIndex = index;
		isImageLoading = true;
		document.body.style.overflow = 'hidden';

		// Focus the dialog for screen readers
		setTimeout(() => {
			dialogElement?.focus();
		}, 0);
	}

	function closeLightbox() {
		selectedImage = null;
		// Restore body scroll
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

	// Handle image load completion
	function handleImageLoad() {
		isImageLoading = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!selectedImage) return;

		switch (event.key) {
			case 'Escape':
				closeLightbox();
				break;
			case 'ArrowLeft':
				navigatePrevious();
				break;
			case 'ArrowRight':
				navigateNext();
				break;
		}
	}
</script>

<!-- Keyboard event listener -->
<svelte:window onkeydown={handleKeydown} />

{#if images.length >= 1}
	<div class="picture-grid grid gap-2 {gridClass} items-start">
		{#each images as image, index}
			<div
				class={getImageAttributes(index, imageCount).classes}
				onclick={() => openLightbox(image, index)}
				onkeydown={(e) => e.key === 'Enter' && openLightbox(image, index)}
				role="button"
				tabindex="0"
			>
				<enhanced:img
					src={image.src}
					alt={image.alt}
					title={image.title || image.alt}
					class="picture-image w-full h-full object-cover hover:scale-[103%] transition-transform duration-300"
					loading="lazy"
					sizes={getImageAttributes(index, imageCount).sizes}
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
					style="max-width: calc(100vw - 4rem); max-height: calc(100vh - 4rem);"
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
		/* @apply aspect-[4/3] md:aspect-[16/9]; */
		@apply aspect-[4/3];
		@apply relative;
	}

	/* Images fill their containers with object-cover for cropping */
	.picture-image {
		@apply absolute inset-0;
		/* Default: crop portraits, maintain landscapes */
		object-position: center;
	}

	/* Custom grid for odd number of images: 2 on top rows, last one spanning full width on bottom */
	.odd-image-grid {
		grid-template-columns: 1fr 1fr;
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
		animation: fadeInSpinner 0.1s ease-out 0.2s forwards, spin 0.6s linear 0.2s infinite;
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
