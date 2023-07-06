---
title: 'Svelte at scale: quick feedbacks'
description: 'Some feedbacks about deploying Svelte in large-scale company and teams'
date: '2019-11-17'
tags: ['svelte', 'engineering', 'web']
published: true
---

Original post: https://gist.github.com/0gust1/e3db417a3fbdb4e52e46299392d7ee63

(Feedbacks from the trenches, originally asked by Xavier and Alexis)

## Context :

- ~8/10 front-end developers working on a "core" ecommerce solution, with various technical levels/experience
- ~15 (more to come) front-end developers (from different countries) extending/overriding the "core" ecommerce solution, again with various technical level/experience
- 2 back-end developers maintaining a React widget / microfrontend
- 2 fullstack developers contributing occasionally.
- those numbers will evolve as Svelte is spreading in my client's projects ;-)

Very diverse technical backgrounds :

- Beginners in all domains,
- markup/CSS experts with _no experience_ in component-based libraries/frameworks
- seasoned front-end devs that already used VueJS or React
- "fullstack" devs
- backend devs

## Feedbacks from the team(s) :

At first sight, the Svelte syntax is familiar to everyone : it looks like plain oldschool HTML/CSS/JS.  
A designer or a webmarketer can quickly contribute a "dumb" component. It helps **a lot** the onboarding of beginners.  
The conciseness of source code is also greatly appreciated. The basic reactivity features are understood quickly by beginners (reactive computed properties and reactive stores needs a little more effort).

The 2 back-end developers were very fast rewriting their React widget in Svelte. They were really fan of it against React (!).
The hard part (unsurprisingly) for them was the styling (not related to Svelte itself).

The main struggle I noted with some people in the team :

People not experienced with component based tools (but experts in HTML/CSS), gained confidence very quickly but were somewhat lost when components tree grew bigger : state management and communication across components.

I don't see that as a Svelte-specific issue, as the patterns used in component-based tools are "all the same" :

- Downward data flow using props
- Events to offer an quick upward data flow
- Store suscribing to share state accross siblings or distant components in the tree

Of course Svelte offers some specific (killer) features (reactive stores, some special directives like `use`, or the `setContext()/getContext()`), and several times I had to suggest people to use and leverage reactive stores instead of using events.

Eventually, the Svelte documentation could be improved toward beginners. It's really dry, with minimal examples (which is great for experienced devs, but beginners can struggle to generalize).

## My own opinion :

- **The key point of Svelte : its inclusiveness, because of its syntax.** It's the point that everyone agrees on. It's even easier than VueJS to onboard devs on it.
- **The reactive-first and compile-time philosophy** is the second key point. The solid "out of the box" webperformance is the consequence ;-)
- **The overall point of view and hindsight of main authors/contributors** about the web, its evolution and the standards. Even if Svelte is still a small (but growing) project, it's managed in a great way for it's size, professional and kind.

Svelte also completely leverage ES6 and ESM (but now all the competing solutions do it also, sometimes less elegantly).
Everytime I asked myself "how will I do this", the final solution was always easier and more concise than expected.

Svelte V3 took other projects (React, Vue) by surprise, and it was cool seeing React and Vue communities borrowing some concepts and mechanisms (sometimes with the help of Svelte maintainers/authors !).

The compiler behind svelte enable (and will enable) to do a lot of things (preprocessing, dev-tooling, tree-shaking, dead CSS elimination/checking).
There is a ongoing work (maybe finished, IDK, I'm overworked these times) to make the compiler API more friendly and extendable. I also like a lot the basic a11y/HTML compliance checking.

As I grew older in my career, I took precautions to stay quite critical about the tools I use, and to not become a "fanboy". I must confess that I have a lot of overall enthusiasm for Svelte :-) .

Svelte could improve over some subjects (that are already identified / worked on) :

- style management accross big component trees. There is the `:global()` "directive", but it feels a little awkward (there is an ongoing RFC about that)
- props checking / type checking and management. There is ongoing work to support typescript (but I still have mixed feelings about TS ^^)
- I like a lot the quite low-level granularity used by Svelte, but it can confuse some people : in Svelte you don't have Redux (thanks god ! :D), but you can build your own with Reactive stores composition / derivation. It's a strength IMHO, but not always in all contexts. Sometimes, I think that Svelte does not enough, sometimes I think that Svelte does too much. It really depends on the project (or subproject), the team and the technical level of it.
