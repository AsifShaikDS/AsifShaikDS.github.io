---
title: Cutting a natural-language SQL agent from about 30 seconds to 5–7
summary: The model did not change. The structure of query generation, what was cached, and how much context was sent all did.
role: Engineer
period: '2025'
access: 'Internal product · code confidential'
stack: [Python, Redis, PostgreSQL, LLM tool calling]
note: Employer product work. No proprietary code, prompts or schemas appear on this page. The reasoning and the measurements are mine.
featured: false
order: 4
---

## The problem

An agent that answers questions about a database in plain language: someone asks a question, the
agent writes SQL, runs it, and explains the result. It worked, and it took about thirty seconds to
answer, which in practice means people ask it one question and then go back to asking a colleague.

The reflexive fix is a faster model. That was the first thing suggested and it was the wrong shape
of answer, because almost none of the thirty seconds was the model thinking quickly or slowly. It
was how much we were sending it, how often we were sending it, and how often we had to send it
twice.

## What I owned

I did this work. It sat inside a larger product I wasn't the only engineer on; the latency
investigation, the restructuring of query generation, the caching layer and the context trimming
are mine.

## Decisions

**Measure percentiles before touching anything.**

I started with an average, because that's the number that was already being quoted, and the average
said thirty seconds. The average was hiding the shape of the problem entirely. The median response
wasn't the thing making the agent feel broken. The tail was, and the tail was almost all retries
after the first generated query came back malformed or semantically wrong.

If I had optimised the average I'd have spent the time shaving a couple of seconds off the happy
path and the agent would still have felt unusable, because what people remember is the answer that
took a minute. This cost me most of a day before I wrote any code and it changed what I built.

**Split query generation into schema selection and then generation, instead of one call over the
whole schema.**

One prompt containing the full schema is simpler and it's where the system started. It's slow for
the obvious reason (a wide schema is a lot of tokens on every question) and slow for a
less obvious one: it is also *less accurate*, because the model has more places to be wrong, and
every wrong query costs a full round trip to discover and repair. The tail I had just measured was
largely made of those repairs.

Selecting the relevant tables first and generating against a narrow schema attacks both at once. The
cost is an extra hop, and a new failure mode that's worse than the one it replaced if you're
careless: when table selection picks wrong, the generated query is syntactically perfect and scoped
to entirely the wrong data, which is a silent failure rather than a loud one. I made that step cheap
to re-run and made its choice visible in the trace, so a wrong answer can be traced to the moment it
went wrong rather than argued about.

**Cache the resolved work, not the prompt string.**

Prompt-response caching on the exact input text is trivial to add and has a hit rate near zero here,
because two people asking the same question phrase it differently every time. What repeats isn't the
wording but the resolved schema for a question of that shape, and the result set for a
question that has genuinely been asked before.

Caching those in Redis is where a large part of the improvement came from. It also bought a problem
I had to solve rather than ignore: cached results go stale as the underlying data changes, so the
TTL is an explicit trade between how fresh an answer is and how fast it arrives. I'd rather
choose that number deliberately and be able to defend it than let it be an accident of whatever
default the cache library shipped with.

**Trim context rather than raise the limit.**

The tempting move when context is tight is to send more and let the model sort it out; larger
context windows make it feel free. It isn't free: time to first token scales with what you send,
and most of what was being sent was schema the query would never touch.

Trimming to what the question needs costs an occasional miss, where a genuinely required column had
been trimmed away. That case is handled by widening the context and retrying once, which is slower
than the trimmed path and still much faster than sending everything every time.

## What went wrong

The schema-selection step made the average dramatically better and briefly made the worst case
worse. When selection missed a table, the agent produced a confident, well-formed answer about the
wrong subset of the data, which is a far more dangerous failure than the slow, obviously-broken
behaviour it replaced.

Speed made a correctness problem easier to miss. That's worth stating plainly, because it's the
part of this work I'd not have predicted: I optimised a system into a shape where its errors
became quieter. Making selection visible in the trace and cheap to re-run is the mitigation, and it
is a mitigation rather than a fix.

## Outcome

- Typical end-to-end response went from roughly 30 seconds to 5–7 seconds.
- None of that came from a different or faster model. It came from generating against a narrower
  schema, caching the resolved work rather than the prompt, and sending less.
- The improvement is largest at the tail, which is the part that was actually driving people away.
- The remaining cost is a staleness window on cached results, chosen deliberately, and a
  table-selection step that can be wrong quietly. Both are visible in the trace.
