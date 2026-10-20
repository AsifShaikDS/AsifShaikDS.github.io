---
title: A permit review and e-signature workflow for a state transportation agency
summary: Tech lead on a system that decides who is allowed to approve a permit, in what order, and whether a legally required signature was actually collected.
role: Tech lead
period: 2025 – present
access: 'Client work · code confidential'
stack: [Python, TypeScript, React, AlloyDB, Firestore, GKE, Cloud Build]
note: Client work for a public agency. No proprietary code, data, documents, screenshots or system names appear on this page. The architecture below is redrawn from scratch and describes technique, not the client's implementation.
featured: true
order: 1
---

## The problem

A U.S. state department of transportation issues permits that several people have to approve, in a
defined order, and sign. Some of those signatures aren't a formality. A permit issued without one
isn't valid, and that's a legal fact rather than a product opinion.

The obvious way to model this is an ordered list of approvers with a pointer that advances as each
one signs. It's the version that fits on a whiteboard and it's what most workflow tools give you.
It also has a specific hole in it, and the hole only opens when the same person holds two roles at
once, which in an agency where people cover for each other is a Tuesday.

## What I owned

I'm the tech lead on delivery. I own the role-delegation and approval-seat engine, the part that
decides who may sign what and in which order, plus the multi-holder escalation model, the real-time
voice interface, and the release path across four GKE environments. I do the cross-stack root-cause
work: tracing a defect from a React and TypeScript frontend through Python services into AlloyDB
and Firestore, and deciding which of those layers should own the fix.

I didn't build the agency's underlying systems of record, and I'm not the only engineer on this
project. Where I say "I decided" below, I mean I made the call and defended it.

## What a permit has to get through

The flow below is the problem, not my solution to it.

<figure class="dia">
<figcaption>What a permit has to get through</figcaption>
<div class="dia__flow">

  <div class="dia__node">
    <b>Submitted</b>
    <span>An applicant files a permit that several people have to approve.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node">
    <b>Who reviews it</b>
    <span>Resolved from role and district, and from any delegation in force at
    the time. The same person can legitimately hold more than one role.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node">
    <b>Approvals, in order</b>
    <span>Each required approval is a separate obligation. Some carry a
    signature that is a legal requirement rather than a formality.</span>
  </div>

  <div class="dia__link"></div>

  <div class="dia__node dia__node--key">
    <b>Is it actually complete?</b>
    <span>The hard question, and the one the whole system exists to answer
    correctly. A permit that looks complete on every screen is not the same
    as a permit that collected every signature it legally owed.</span>
  </div>

  <div class="dia__label">Yes / no</div>

  <div class="dia__row dia__row--two">
    <div class="dia__node">
      <b>Issued</b>
      <span>With an audit trail showing who signed what, and when.</span>
    </div>
    <div class="dia__node dia__node--muted">
      <b>Still open</b>
      <span>Escalated to whoever else can act, so it does not sit waiting on
      one person who is unavailable.</span>
    </div>
  </div>

</div>
<p class="dia__note">This is the shape of the problem, not the design. The
implementation belongs to the client, and the interesting parts of it are
things I would rather talk through than publish.</p>
</figure>

## Problems resolved

**Permits could reach "complete" without collecting a signature they legally owed.**

When one person legitimately held two roles at once, which in an agency where people cover for
each other happens constantly, the system could treat a single approval as satisfying both
obligations. The permit then looked finished on every screen while a legally required e-signature
had never been requested, and every validation gate in place at the time passed it.

I found it, established it was a class of defect rather than a single case, and owned both the fix
and the audit of permits that had already gone through the old path. What the fix was belongs to
the client. It is also the part of this project I would most like to be asked about.

**Permits stalled for days waiting on one named person.**

If the single approver on a step was on leave, the permit simply sat there. The workaround, a
screen for reassigning it, had quietly become an untracked way to change who held authority, in a
system whose entire purpose is to be strict about exactly that.

Resolving it meant making "who may act here" a question with more than one valid answer without
making authority easier to change than before. The cost landed in notification, reminder and
escalation logic, which got substantially more complicated, and in having to decide what happens
when two eligible people act at nearly the same moment.


**The voice interface streams speech as it's generated, rather than synthesising the full reply
first.**

Synthesise-then-play is much easier to build and it produces better-sounding audio, because the
synthesiser sees the whole sentence before it starts. It also puts several seconds of complete
silence between the end of a question and the start of the answer. In a voice interface that
silence doesn't read as "thinking", it reads as "broken", and people repeat themselves into it,
which produces a second overlapping request and makes it genuinely broken.

Streaming audio out as the response is generated cost me partial-utterance state to manage and the
need to cancel synthesis mid-flight when the user speaks over it. I'd make the same trade
again. Perceived latency in a voice interface isn't a polish item; it is the difference between a
feature and a thing people stop using.

## One rule I hold

**Defects get fixed at the layer that owns the invariant, not the layer that surfaced them.**

The fastest fix for the seat bug would have been in the frontend, where it was visible. A guard
there would have made the screen honest and left the record wrong, which is worse than the original
bug: now the data and the display disagree, and only one of them is the thing a court would read.

The cost of holding this line is that individual tickets take longer, and that I've to be able to
read the whole stack (the React frontend, the Python services, the AlloyDB query plans, the
Firestore documents) well enough to tell where an invariant actually lives. That's most of why I
can now debug across all four.

## What went wrong

The seat-merge defect wasn't found by an alarm. It could not have been: nothing had failed. No
error was thrown, no request timed out, no signature was rejected. A signature was simply never
requested, and there's no monitor for an event that doesn't happen.

It was found by reading the state machine and asking what happens when two seats resolve to the
same person, a question I asked because the delegation work made it likely rather than because anything
had visibly gone wrong. The lesson is narrow and I've used it since: absence-of-event bugs need an
explicit invariant check, because monitoring only ever sees things that happen. The system now
makes that check on every completion attempt, and it fails closed.

## Outcome

- The defect class is unreachable by construction rather than guarded against, so the failure mode
  changed from "silently skipped" to "visibly blocked".
- Reassignment of approval authority is no longer an untracked override, and it leaves a trail.
- Permits no longer stall indefinitely on a single unavailable approver.
- Voice queries against permit status are in production, with the answer starting to speak while it
  is still being generated.
- Delivered continuously across four GKE environments through Cloud Build. I own that release path.

I've not put throughput or processing-time figures on this page. I've them and I will discuss
them in an interview, but they're the agency's operational numbers rather than mine to publish.

## See this thinking in public

The code here isn't mine to publish. The two pieces of it that transfer, orchestration and
extraction that's evaluated rather than assumed, are what I'm rebuilding in the open on public
documents. Both are listed with their real status on the [home page](/). Neither is finished, and I
would rather say that than link to something that isn't there.
