/**
 * Everything on the site that is a fact about Asif rather than a case study.
 * If a sentence here stops being true, this is the only file you have to open.
 */

export const site = {
  name: 'Shaik Asif',
  /** The specialism, not the job title. This is the line that gets read. */
  role: 'AI Engineer, LLM systems and agent orchestration',
  /** Same string; kept separate in case the two ever need to differ. */
  roleFlat: 'AI Engineer, LLM systems and agent orchestration',
  location: 'Hyderabad, India',
  employer: 'Techolution',
  url: 'https://asifshaikds.github.io',

  /** One short line, set large. This is the only sentence some people read. */
  headline: 'I build the layer between a language model and a system that has to be right.',

  /** The supporting detail, set smaller underneath the headline. */
  intro:
    "For two years at Techolution that's meant a provider-agnostic orchestration layer serving 100+ production agents, and tech-leading a permit review and e-signature workflow for a U.S. state department of transportation.",

  /** <meta description>. Under 160 characters. */
  description:
    'AI Engineer in Hyderabad building LLM orchestration, multi-agent systems and document workflows that hold up in production.',
} as const;

export const links = {
  email: 'asif.ds.2024@gmail.com',
  github: 'https://github.com/AsifShaikDS',
  linkedin: 'https://www.linkedin.com/in/shaikasif24/',
  /**
   * PLACEHOLDER — drop the current CV at public/resume.pdf and set this to '/resume.pdf'.
   * Leave it null until then; the link hides itself rather than 404ing.
   */
  resume: null as string | null,
} as const;

/**
 * ANTI-ROT CONTROL. This line is the reason the last site rotted for three years
 * and nobody noticed. Update the date every time you touch the site. If the date
 * is more than a quarter old, that is the signal to reread the hero paragraph.
 */
export const now = {
  updated: 'September 2026',
  text:
    "Tech-leading a permit review and e-signature workflow for a U.S. state department of transportation, and interviewing for AI/LLM systems roles in India. Outside work I'm building an evaluation harness for document extraction, which is the thing I keep wishing existed at the start of a project rather than the end.",
} as const;

/**
 * Home page proof strip. Short facts, no counters, no skill bars.
 * Three or four items. If you need a fifth, cut one first.
 */
export const proof = [
  {
    label: 'Orchestration',
    text: 'One tool-calling interface across Anthropic, Vertex AI, OpenAI and Azure OpenAI, serving 100+ production agents.',
  },
  {
    label: 'Delivery',
    text: 'Tech lead on a permit review and e-signature workflow for a U.S. state department of transportation.',
  },
  {
    label: 'Latency',
    text: 'Cut a natural-language SQL agent from ~30s to 5–7s without changing the model.',
  },
  {
    label: 'Based in',
    text: 'Hyderabad, India. Open to AI/LLM systems engineering roles.',
  },
] as const;
