/**
 * Public repos. This list is deliberately hand-written rather than pulled from the
 * GitHub API: the API cannot tell you which repos are worth a stranger's attention.
 *
 * `status: 'planned'` renders as a visible, honest placeholder. It says the repo
 * does not exist yet instead of inventing a link. Flip it to 'live' and fill in
 * `href` on the day the repo goes public. Delete the entry if the plan changes.
 */
export type Project = {
  name: string;
  status: 'live' | 'planned';
  href?: string;
  summary: string;
  /** Why this exists. Not what it does; why it was worth building. */
  why: string;
};

export const projects: Project[] = [
  {
    name: 'Multi-provider LLM orchestrator',
    status: 'planned',
    summary:
      'A small, readable implementation of the layer I own in production: one tool-calling interface, several providers behind it, chat-history normalisation and a memory strategy you can actually read end to end.',
    why:
      'Not an original framework, and it does not try to be one. It exists so that the orchestration work described in my case studies is something you can read rather than take my word for.',
  },
  {
    name: 'Eval-first document extraction',
    status: 'planned',
    summary:
      'A document extraction system built harness-first: gold set and scoring before the extractor, on public documents, with the failure cases kept in the repo rather than deleted.',
    why:
      'Every extraction project I have worked on built the evaluation last, after the pipeline was already hard to change. I want to find out what it costs to do it in the other order, and to have the numbers in public when I claim it was worth it.',
  },
];
