# Voice

This site ships under one name. It should read like the person whose name is on it wrote it,
which means avoiding the handful of habits that make text read as machine-written. The rules
below are not stylistic preference. They exist because the first draft of this site failed the
sniff test and these were the reasons.

Run `npm run voice` before publishing.

## 1. Em dashes

Budget: **zero in body copy.** One per page if a sentence genuinely needs it.

The first draft had 47 across 6,500 words, roughly one every 140. Human technical writing runs
one per 500 to 1,500, and plenty of engineers never use one.

Replace with a comma, a full stop, a colon, or brackets. Do not swap one long dash for another
piece of punctuation in the same slot every time; if a sentence leans on a dash it usually wants
restructuring, not resetting.

```
bad   The hard parts are unglamorous — normalising chat history, deciding what to drop.
ok    The awkward parts are normalising chat history and deciding what to drop.
```

En dashes in number ranges (`5–7s`, `2024–2026`) are fine. They are not the problem.

## 2. No one-line punchlines

The long-sentence-then-short-jab rhythm is the strongest tell there is. Real examples cut from
the first draft:

> All of it.
> It surfaces.
> That case fails loudly.
> Multiply by a hundred agents.
> The message roles differ. Streaming semantics differ.

Fold the fragment into the sentence before it. A short sentence is fine when it is carrying
information; it is not fine when its job is rhetorical timing.

## 3. Contractions

Write `I'm`, `it's`, `don't`, `can't`, `isn't`. The first draft used none, and the combination of
formal register with punchy fragments is what made it read as generated rather than merely
careful.

## 4. Avoid the parallel-construction reflex

Three-item lists where two would do, matched clause pairs, and sentences built to balance. One
balanced sentence in a page is good writing. Four in a row is a pattern.

## 5. Words that do not appear here

`delve` · `leverage` (as a verb) · `seamless` · `robust` · `landscape` · `realm` · `tapestry` ·
`underscore` · `testament to` · `at its core` · `it's not just X, it's Y` · `crucially` ·
`importantly` · `notably` · `in the world of`

The first draft was already clean on these. Keep it that way.

## 6. What to keep

Being plain is the goal, not being terse or folksy. Long sentences are fine. Technical precision
is fine. Naming a specific tool inside a sentence about a decision is the whole point of the
site. What is being removed is the rhythm, not the substance.
