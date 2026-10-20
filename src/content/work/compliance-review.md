---
title: Grounding an automated compliance reviewer so its findings are worth reading
summary: A solo prototype that reviews submissions against a federal regulatory manual, and only reports a conflict when it can quote the two passages that contradict each other.
role: Solo, research and build
period: '2026'
access: 'Internal R&D · code confidential'
stack: [Python, retrieval, vision OCR, evaluation]
note: An internal research prototype. No proprietary code, prompts, documents or system names appear on this page. What follows describes the technique and the choices behind it.
featured: true
order: 3
---

## The problem

Certain submissions have to comply with a federal regulatory manual. The manual is long,
cross-referenced, and written in a register where "shall", "should" and "may" mean three genuinely
different things. A human reviewer reads a submission against it and writes up what doesn't
comply.

The naive automation is one paragraph long: embed the manual, retrieve the relevant chunks for a
submission, ask a model whether it complies. I built roughly that first, and it produces a confident
flood of findings, most of which a real reviewer would never raise. A model asked to find problems
will find problems. The output isn't wrong so much as useless, and a reviewer who dismisses three
findings in a row stops reading the fourth, which is the one that mattered.

So the interesting problem isn't extraction or retrieval. It's precision, and specifically what
you're willing to give up to get it.

## What I owned

All of it. This was a solo research build: I chose the approach, wrote it, and evaluated it. It's
a prototype and I didn't take it to production. What I've to show for it's the reasoning below
and a set of things I'd now do differently, which is why the last section on this page is the
one I'd want read.

## Architecture

<figure class="dia">
<figcaption>One submission, one finding, and the gate it has to pass</figcaption>
<div class="dia__flow">

  <div class="dia__node">
    <b>Submission</b>
    <span>A digital PDF, or a scan with no usable text layer.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node">
    <b>Per-page ingest</b>
    <span>Use the text layer where there is a plausible one. Route only the
    pages without it to vision OCR, rather than the whole document.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node dia__node--key">
    <b>Checklist from adopted policy</b>
    <span>The questions come from what the agency has actually adopted, not
    from the regulatory manual. This is the decision the rest depends on.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node">
    <b>Per-question retrieval</b>
    <span>Each question pulls only the passages it needs, from the submission
    and from the policy, instead of pushing the whole document into context.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node">
    <b>Candidate finding</b>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node dia__node--key">
    <b>Contradiction gate</b>
    <span>Can I quote a span from the submission and a span from the policy
    that genuinely contradict each other?</span>
  </div>

  <div class="dia__label">Yes / no</div>

  <div class="dia__row dia__row--two">
    <div class="dia__node">
      <b>Reported</b>
      <span>Carries both quotes, so a reviewer can check it in seconds.</span>
    </div>
    <div class="dia__node dia__node--muted">
      <b>Dropped</b>
      <span>Dropped, not downgraded to a warning. A maybe-finding costs more
      attention than it saves.</span>
    </div>
  </div>

</div>
</figure>

## Decisions

**The checklist is generated from the agency's own policies, not from the regulatory manual.**

Deriving it from the manual is the obvious move, since the manual is the authority, so make it the
source. It doesn't work, and the reason is a category error rather than a technical one. Much of a
design manual is guidance and permission, not requirement. Turning it into a checklist manufactures
hundreds of "requirements" that nobody has ever enforced, and every one of them becomes a finding
waiting to be raised.

What actually binds a submission is the set of policies the agency has adopted. That set is far
smaller and it's written in obligations. Generating the checklist from it cut the question space by
an order of magnitude before a single model call.

The cost is that the system inherits the policies' blind spots exactly. If the agency never wrote a
rule down, this will never flag a violation of it. That's a real limitation, and it's the correct
one to accept: a reviewer's judgement about unwritten practice was never something I was going to
automate, and pretending otherwise would have produced confident findings with no authority behind
them.

**Every flagged conflict has to be backed by a quotable contradiction.**

The alternative is to report the model's judgement with a confidence score attached. This is
extremely common and I think it's close to useless: a generative model's stated confidence isn't
calibrated against anything, so a 0.82 doesn't mean what the number shape implies, and reviewers
learn to ignore the column within a day.

Instead, a finding survives only if the system can point at a span in the submission and a span in
the policy that are actually in conflict. No quotable contradiction means no finding: dropped, not
downgraded to low confidence. That distinction is the whole decision. Downgrading keeps the noise on
the page and moves the burden back to the reviewer; dropping removes it.

The cost is recall, and it isn't small. Real issues that are implied rather than stated get
dropped. I chose that deliberately: in a review workflow the scarce resource is the reviewer's
willingness to keep reading, and that's spent by false positives, not by misses. A tool that raises
five findings and is right about five gets used. A tool that raises fifty and is right about eight
gets turned off, and then it's right about zero.

**Per-question retrieval instead of putting the whole document in context.**

Long-context models make "just send everything" tempting and it demos beautifully. It degrades in
three ways at once: attention on a specific clause weakens as the document grows, cost scales with
the whole document on every single question, and, the one that actually killed it, there's no way
to tell which part of the document a finding came from, which makes the contradiction gate above
impossible to implement.

Retrieving per question means each finding is traceable to a location by construction. The cost is
that retrieval becomes its own failure mode: if the right clause isn't retrieved, the question gets
answered confidently against the wrong evidence. So retrieval has to be evaluated separately from
the answer, and I learned that the hard way rather than by design.

**Vision OCR per page, but only where the text layer is absent or implausible.**

A meaningful share of submissions are scans, and some are photographs of drawings. A text-layer
extractor on those either returns nothing or returns a reordered soup where annotations have
drifted away from what they annotate. Running a vision model per page preserves the layout that
carries the meaning.

It's also slower and more expensive per page, so it isn't the default. Pages are routed: use the
text layer where it exists and looks like prose, fall back to vision where it doesn't. That routing
rule is a heuristic and it's the part of the ingest path I trust least.

## What went wrong

The honest failure of this project wasn't in the model. It was that I tuned against submissions I
had already read.

The prototype scored well on the handful of documents I had picked, and it kept scoring well,
because I was the one judging. When I ran it on submissions I had not seen, I had no way to tell
whether the last three prompt changes had made it better or only different. There was no gold set,
no held-out split and no scoring, so every improvement was a story I was telling myself.

That's the most useful thing this project taught me, and it isn't a technique. It's that on every
extraction and review system I've worked on, the evaluation was built last, after the pipeline was
already too entangled to change. I've never once seen that order work well. It's the specific
reason the public project I'm building now starts with the harness and the gold set, before the
extractor exists at all.

## Outcome

Stated carefully, because this was a prototype and not a production system.

- The contradiction gate collapsed the noise. A finding that reaches a reviewer carries the two
  passages they need to accept or dismiss it, which turns a judgement call into a few seconds of
  reading.
- Generating the checklist from adopted policy rather than the manual removed most of the question
  space before any model ran, which is where the largest single improvement came from.
- Scanned and photographed submissions are handled rather than skipped.
- I don't have a held-out evaluation to quote, because I didn't build one. That gap is the
  finding, not a footnote.

## See this thinking in public

The public project I'm building is the direct consequence of the last section: an extraction system
built evaluation-first, on public documents, with the gold set and the failure cases in the repo
rather than deleted. It's listed with its real status on the [home page](/).
