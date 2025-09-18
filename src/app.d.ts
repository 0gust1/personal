// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		// interface MdsvexFile {
		// 	default: import('svelte/internal').SvelteComponent;
		// 	metadata: Record<string, string>;
		// }

		type MdsvexResolver = () => Promise<MdsvexFile>;

		interface BlogPost {
			type: string;
			originalContentPath: string;
			contentURL: string;
			slug: string;
			title: string;
			author?: string;
			description?: string;
			date: string;
			tags?: string[];
			published: boolean;
			hidden?: boolean; // will generate a page, but not show in lists, navigation and RSS feeds
			lang?: string;
			updated_at?: string;
		}
	}
}

export {};
