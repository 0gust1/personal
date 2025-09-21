<script lang="ts">
	import { ArrowPathIcon, XMarkIcon } from 'heroicons-svelte/24/outline';
	
	interface Props {
		show: boolean;
		onReload?: () => void;
		onDismiss?: () => void;
	}

	let { show, onReload, onDismiss }: Props = $props();

	function handleReload() {
		if (onReload) {
			onReload();
		} else {
			// Default behavior: reload the page
			window.location.reload();
		}
	}

	function handleDismiss() {
		if (onDismiss) {
			onDismiss();
		}
	}
</script>

{#if show}
	<div
		class="update-notification"
		role="alert"
		aria-live="polite"
		aria-describedby="update-message"
	>
		<div class="update-content">
			<div class="update-icon">
				<ArrowPathIcon class="w-5 h-5" />
			</div>
			<div class="update-text">
				<p id="update-message" class="update-title">Update Available</p>
				<p class="update-description">A new version of the site is available.</p>
			</div>
			<div class="update-actions">
				<button
					type="button"
					onclick={handleReload}
					class="reload-button"
					aria-label="Reload page to get the latest version"
				>
					Reload
				</button>
				{#if onDismiss}
					<button
						type="button"
						onclick={handleDismiss}
						class="dismiss-button"
						aria-label="Dismiss this notification"
					>
						<XMarkIcon class="w-4 h-4" />
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.update-notification {
		@apply fixed bottom-4 left-4 right-4 z-50;
		@apply bg-cosmiclatte-50 dark:bg-eigengrau-800;
		@apply border border-cosmiclatte-200 dark:border-eigengrau-700;
		@apply rounded-lg shadow-lg;
		@apply max-w-sm;
		animation: slideIn 0.3s ease-out;
	}

	:global(.dark) .update-notification {
		@apply bg-eigengrau-700 border-eigengrau-600;
    @apply shadow-eigengrau-900;
	}

	@keyframes slideIn {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.update-content {
		@apply p-4 flex items-start gap-3;
	}

	.update-icon {
		@apply flex-shrink-0 text-cosmiclatte-600;
	}

	:global(.dark) .update-icon {
		@apply text-cosmiclatte-200;
	}

	.update-text {
		@apply flex-1 min-w-0;
	}

	.update-title {
		@apply text-sm font-medium mb-1 text-eigengrau-900;
	}

	:global(.dark) .update-title {
		@apply text-cosmiclatte-100;
	}

	.update-description {
		@apply text-sm text-eigengrau-600;
	}

	:global(.dark) .update-description {
		@apply text-cosmiclatte-200;
	}

	.update-actions {
		@apply flex items-center gap-2 flex-shrink-0;
	}

	.reload-button {
		@apply px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200;
		@apply text-cosmiclatte-50 bg-cosmiclatte-500/70 hover:bg-cosmiclatte-500/80;
		@apply focus:outline-none focus:ring-2 focus:ring-cosmiclatte-500 focus:ring-offset-2;
	}

	:global(.dark) .reload-button {
		@apply bg-cosmiclatte-100/50 hover:bg-cosmiclatte-100/70 focus:ring-offset-eigengrau-800;
	}

	.dismiss-button {
		@apply p-1.5 rounded-md transition-colors duration-200;
		@apply text-eigengrau-400 hover:text-eigengrau-600;
		@apply focus:outline-none focus:ring-2 focus:ring-eigengrau-500 focus:ring-offset-2;
	}

	:global(.dark) .dismiss-button {
		@apply text-eigengrau-300 hover:text-cosmiclatte-300 focus:ring-offset-eigengrau-800;
	}
</style>