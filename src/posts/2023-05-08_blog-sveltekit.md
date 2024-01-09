---
title: 'How this website is built'
date: '2023-05-08'
updated_at: '2023-07-30'
tags: ['sveltekit', 'web', 'code']
published: true
---

This website is built using [SvelteKit](https://kit.svelte.dev/), a framework for building web applications of all sizes.

The requirements are:

- static website: no server runtime needed
- content is written in markdown
- RSS feeds are great, RSS is not dead

## Perfectionism kills / better done than perfect

I can't count the number of times I coded static web generators (professionally or not). This time, having much less time than before, I wanted to avoid the perfectionism trap, and focus publishing and content.

As a side effect, expect some broken and ugly things sometimes. Everyhting will be done iteratively.

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
