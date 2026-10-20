---
layout: ../layouts/Page.astro
title: About
description: Shaik Asif, AI Engineer in Hyderabad working on LLM orchestration, agent systems and document workflows.
lede: I build the layer between a language model and a system that has to be right.
---

I'm an AI Engineer at Techolution. Most of my work sits underneath the agents rather than inside
them: a provider-agnostic integration and orchestration layer that lets a hundred-plus production
agents call tools without knowing or caring whether the answer came from Anthropic, Vertex AI,
OpenAI or Azure OpenAI. I wrote the chat-history normalisation that makes a conversation portable
between those providers, the sliding-window memory strategy that decides what a long conversation
is allowed to forget, and the cross-region failover that keeps an agent alive when a region isn't.

I came into this from the data science side, and the useful thing that transition taught me is
that the model is almost never the hard part. The hard part is what happens when a model returns
something plausible and wrong and a person downstream has to catch it before it reaches a system
of record. Most of what I've built since is about that gap: constraining what a model may return,
gating an action on evidence rather than on the model's confidence, and routing the uncertain
cases to a human instead of guessing.

The project I've learned the most from is a permit review and e-signature workflow I tech-lead for
a U.S. state department of transportation. I own the role-delegation and approval-seat engine, the
part that decides who's allowed to sign what and in which order, which turns out to be where the
legally consequential bugs live. I also do the cross-stack root-cause work on that project, so the
same defect might end with a fix in a React and TypeScript frontend, in a Python service, or in an
AlloyDB query plan, and part of my job is deciding which of those is the right place to fix it
rather than the easiest.

## What I'm doing about the gaps

Two years in, I can point at production systems but not at much public code, because almost none
of it is mine to publish. That's a real weakness in a portfolio and I'd rather name it than route
around it. So I'm rebuilding the two most transferable pieces in the open, on public documents,
with the failure cases kept in the repo instead of deleted: a small multi-provider orchestrator,
and a document extraction system built evaluation-first. Neither is finished, and both are listed
on the [home page](/) with their real status.

## What I want next

Work where a language model is load-bearing rather than decorative: agent systems, retrieval that
has to be correct, evaluation infrastructure, the unglamorous reliability layer around a model.
I'd rather join a team that already knows evaluation is the hard part than one that's about to
find out, and I'm based in Hyderabad, India.
