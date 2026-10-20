---
title: A provider-agnostic orchestration layer for 100+ production agents
summary: One tool-calling interface over Anthropic, Vertex AI, OpenAI and Azure OpenAI, so that a hundred-plus agents never have to know which provider answered.
role: Engineer, integration and orchestration layer
period: 2024 – present
access: 'Internal product · code confidential'
stack: [Python, Anthropic, Google Vertex AI, OpenAI, Azure OpenAI, Redis]
note: Employer product work. No proprietary code, prompts, schemas or internal system names appear on this page. What follows is the technique and the reasoning, which are mine.
featured: true
order: 2
---

## The problem

An enterprise multi-agent platform where agents are built by many people, most of whom are solving a
business problem rather than an LLM problem. Four providers are in play (Anthropic, Google Vertex
AI, OpenAI and Azure OpenAI) because different customers, regions and contracts require different
ones, and that isn't a constraint any single team gets to negotiate away.

Every provider expresses tool calling slightly differently. The message roles differ. A tool result
is a distinct message in one place and content inside a turn in another. Streaming semantics differ.
The failure modes differ, and so does which failures are safe to retry.

Left alone, that difference propagates upward and every agent author solves it again, badly, in a
`try` block, once per agent, across a hundred of them.

## What I owned

I own the integration and orchestration layer that sits between the agents and the providers. I
authored the cross-provider chat-history normalisation and the sliding-window memory strategy, and I
designed the automatic cross-region failover.

I didn't build the agent platform above it: the authoring experience, the UI, the deployment
surface and the agents themselves are other people's work. My layer is the part everything else
calls.

## Architecture

<figure class="dia">
<figcaption>Where the provider differences stop</figcaption>
<div class="dia__flow">

  <div class="dia__node dia__node--muted">
    <b>100+ agents</b>
    <span>Built by other teams. None of them knows which provider will answer.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node dia__node--key">
    <b>One tool-calling interface</b>
    <span>Tool schema in, tool call out. Chat history normalised into a single
    shape. Sliding-window memory. Everything below this line is absorbed here.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__row">
    <div class="dia__chip">Anthropic</div>
    <div class="dia__chip">Vertex AI</div>
    <div class="dia__chip">OpenAI</div>
    <div class="dia__chip">Azure OpenAI</div>
  </div>

</div>
<p class="dia__note">Failover moves traffic between regions underneath the
interface. It only retries what is safe to retry: a tool call that may already
have run is surfaced rather than repeated.</p>
</figure>

Everything ugly about provider differences lives in the adapters, deliberately. The interface above
them is the contract agent authors program against, and it doesn't leak.

## Decisions

**One normalised interface, not the subset all four providers implement identically.**

The lowest-common-denominator approach is safer to build: expose only what every provider does the
same way, and nothing can surprise you. The set that survives that filter is small, and the features
it excludes don't disappear. They reappear inside individual agents, where the same problem gets
solved a hundred times by people who should not have to think about it.

So the adapters absorb the difference and the interface stays whole. The cost is that adding a
provider is real engineering rather than configuration, and that I had to decide what happens when a
provider genuinely can't do something the interface promises, and that case fails loudly. Silently
degrading, meaning it quietly drops a capability and returns something plausible, would push a debugging
problem into a hundred agents whose authors have no way to see it.

**Chat history is normalised into one internal representation on write, not translated on read.**

Storing whatever the provider returned and translating at read time is the obvious move: it is
lossless, it's less code, and it defers every hard decision. It also makes two things impossible.
A conversation can't be resumed on a different provider, because the stored shape only makes sense
to the one that produced it. And failover mid-conversation is off the table for the same reason,
which quietly removes the main reason to have a provider-agnostic layer at all.

Normalising on write forced the lossy decisions to be made once, by me, in the open: some
provider-specific fields have no home in the internal shape, and I had to decide which of those are
safe to drop. That's genuinely uncomfortable, and it's the right place for the discomfort to sit.
The other cost is that a change to the internal shape is a migration rather than a new reader.

**Sliding-window memory rather than summarising older turns.**

Summarisation is the more sophisticated-sounding answer and it was seriously considered, and two things
ruled it out. The first is that it puts a model call on the critical path of every long conversation, which is latency
paid by every agent whether or not it needed the recall. And it rewrites facts: a summary that gets
a detail wrong is unrecoverable, because the original turn it replaced is gone, and nothing
downstream can tell that it happened.

A window drops turns, which is a worse-sounding failure and a much better one, because it's visible,
predictable, and the same every time. The cost is honest: agents that genuinely need long-horizon
recall have to handle it explicitly rather than assuming the layer remembers. I'd rather they
know that than believe a summary.

**Failover lives in the layer, and retries only what is safe to retry.**

The alternative is to let each agent catch its own errors. With a hundred agents that means a
hundred retry policies, most of which would be a bare exception handler and a sleep, and none of
which would know whether the call that just failed had already executed its side effect.

Centralising it means the layer has to classify failures rather than treat them as one thing, and
has to be conservative in a specific way: a tool call that may already have run doesn't get
retried automatically, it surfaces instead. That makes the failover less impressive than "we retry
everything" and it's the only version I'd put in front of an agent that can move money or
change a record.

## What went wrong

The first version of history normalisation was written against each provider's documented message
format and validated on conversations that worked. It broke on tool-call and tool-result pairing,
the case where one provider represents a tool result as its own message and another folds it into
the following turn. A conversation started on one and resumed on another could produce a tool call
with no result attached to it, and the next model to see that history would either hallucinate the
result or refuse.

The fix was to stop normalising field names and start normalising the constraint: a tool call and
its result are one unit, that pairing is checked when history is written, and history that violates
it is rejected at the boundary instead of somewhere downstream. Since then, the failures have been
loud and local.

## Outcome

- Agent authors write one integration. Which provider served a request is an operational concern,
  not an authoring one.
- Adding or swapping a provider is a change in one place.
- A conversation can be resumed on a different provider than it started on, which is what makes
  cross-region failover possible at all rather than theoretical.
- The failover path is exercised rather than aspirational, and it declines to retry calls whose side
  effects may already have happened.

## See this thinking in public

I can't publish this code. The smallest honest version of it (one tool-calling interface, several
providers behind it, history normalisation and a memory strategy you can read end to end) is
something I'm rebuilding in public. It's listed with its real status on the [home page](/). It's
not an original framework and it isn't pitched as one; it exists so that this page is checkable
rather than merely asserted.
