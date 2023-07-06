---
title: 'How this website is built'
date: '2023-05-08'
tags: ['sveltekit', 'web', 'code']
published: true
---

This website is built using [SvelteKit](https://kit.svelte.dev/), a framework for building web applications of all sizes.

The requirements were:

- static website: no server runtime needed
- content is written in markdown
- RSS feeds are great, RSS is not dead

## How the build works

To handle content, I used the excellent library [mdsvex](https://mdsvex.com/), which allows to write markdown files with Svelte components integration support, and offers really **deep and powerful extensibility**.

- gather "markdown" (mdsvex) files from `src/posts` and `src/logs` folders
- parse them, gather metadatas (title, tags, publicatuion date, status, etc) and generate Svelte components
- crawl each page of the website to generate the HTML, CSS and JS files that will be served to the client

## code, inspiration end references

At the moment, the code of this website is on a [github repository](https://github.com/0gust1/personal).

I stole some code and ideas from those 2 projects:

- https://github.com/mattjennings/sveltekit-blog-template
- https://github.com/mvasigh/sveltekit-mdsvex-blog
