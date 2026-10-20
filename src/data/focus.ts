/**
 * "What I work on" — four prose paragraphs, not an icon wall.
 *
 * Rule for editing: every paragraph must name concrete tools inside a sentence
 * about a decision. If a paragraph could appear on anyone else's site, rewrite it.
 *
 * Voice: see STYLE.md. Contractions, few em dashes, no one-line punchlines.
 */
export const focus = [
  {
    title: 'Provider-agnostic LLM plumbing',
    body:
      "Most of my production work sits underneath the agents rather than inside them. It's one tool-calling interface that four providers can serve, with the differences absorbed instead of leaking upward. The awkward parts are normalising chat history so a conversation started on one provider can be finished on another, deciding what a sliding window is allowed to drop, and failing over between regions without the agent above noticing. It's Python, and it's used by 100+ agents built by people who shouldn't have to know which provider answered.",
  },
  {
    title: 'Agents that have to be right, not impressive',
    body:
      "A demo agent gets judged on its best run and a production one on its worst, and closing that gap is most of my job. In practice it means constraining what a model is allowed to return, gating an action on evidence rather than on the model asserting it, and sending the uncertain cases to a person instead of guessing. I'd rather ship something honest about the 5% it can't handle than something claiming 99% with no way to show its working.",
  },
  {
    title: 'Retrieval and evaluation',
    body:
      "Retrieval systems fail quietly, so I've ended up caring more about the harness than the pipeline. Per-question retrieval rather than pushing a whole document into context, hybrid retrieval with reranking when lexical and semantic search disagree, and a held-out set that tells you when a prompt change made things worse. The eval loop is the thing I keep rebuilding from scratch on every project, which is why I'm building one properly in the open.",
  },
  {
    title: 'Shipping it, and owning it afterwards',
    body:
      "I deploy what I write, and on the transportation project that meant four GKE environments, Cloud Build pipelines, and being the person who root-causes a defect across a React and TypeScript frontend, Python services, AlloyDB and Firestore before deciding which layer should own the fix. Latency work sits here too: the SQL agent I cut from about 30s to 5–7s got there through query-generation restructuring, Redis caching and context trimming rather than a better model.",
  },
] as const;
