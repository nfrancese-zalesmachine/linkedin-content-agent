/**
 * EU Presence batch generator — 12 posts in English
 * Usage:
 *   npm run test:eu           → runs idea #0 only (quick test)
 *   npm run test:eu -- --all  → runs all 12 ideas in batches of 3
 */
import 'dotenv/config';

const SERVER = process.env.SERVER_URL ?? 'http://localhost:3000';
const RUN_ALL = process.argv.includes('--all');

// ─── Creator profile ──────────────────────────────────────────────────────────

const EU_PRESENCE_PROFILE = {
  creatorName: 'Albi Zhulali',
  language: 'en',
  voiceRules: `
Very short sentences. One idea per line.
No emojis. No bold. No bullet points — use plain lines.
Hook = declarative statement that stops the scroll.
Always concrete data with a named source or real example.
Contrast pattern: "Most companies do X. The ones closing EU deals do Y."
Never corporate. Never "it's important to note". Never "we must consider".
Write from direct experience or a named client scenario.
Numbers anchor every claim — fines, timelines, costs, percentages.
`.trim(),
  icp: 'US-based SaaS and AI founders, Seed to Series C, 10–300 employees, acquiring EU users for the first time, no in-house legal or compliance team',
  pillars: [
    {
      id: 1,
      name: 'EU Compliance for Startups',
      keywords: ['gdpr', 'dsa', 'nis2', 'ai act', 'compliance', 'representative', 'regulation', 'europe', 'eu', 'data protection', 'fine', 'penalty'],
      definition: `
How non-EU startups navigate EU digital law without in-house legal teams.
Key regulations: GDPR (fines up to €20M or 4% of global revenue), DSA, NIS2, EU AI Act.
The "hidden obligation": non-EU companies serving EU users must appoint a local EU representative.
Most founders discover this during a large enterprise deal or investor due diligence — too late.
EU Presence makes compliance a 5-minute setup instead of a 6-month legal project.
Pricing benchmark: GDPR representative at $127/month vs. typical law firm at $1,500+/year.
      `.trim(),
      hookPatterns: `
1. [Number] founders learned this the hard way: [regulation] applies to your startup too
2. Most US startups do X. The ones closing EU enterprise deals do Y.
3. €[fine amount] — that's the real cost of ignoring [regulation]
4. You have EU users. You're already in scope.
5. The compliance step most US founders skip before their first EU enterprise deal
6. [Regulation] took effect. Here's what changed for non-EU SaaS companies.
      `.trim(),
      examples: '',
    },
    {
      id: 2,
      name: 'EU Operations without an Entity',
      keywords: ['eor', 'employer of record', 'entity', 'hire', 'payroll', 'contractor', 'expansion', 'employee', 'team'],
      definition: `
How to hire EU-based employees, run payroll across 27 countries, and build operational presence without opening a legal entity.
EOR at $427/employee/month vs. entity setup that takes 6+ months and $10,000+ in legal fees.
Target scenario: US startup hiring their first EU customer success, sales, or engineering hire.
Common mistake: misclassifying contractors as employees — leads to back-taxes and fines.
EU Presence covers EOR + Contractor of Record + payroll + virtual address + company formation.
      `.trim(),
      hookPatterns: `
1. Hiring your first EU employee without an entity — here's what actually works
2. Entity setup takes 6 months. EOR takes 3 days. Here's the math.
3. [Number] US companies hired in Europe last year without opening a single entity
4. Misclassifying a contractor in Germany costs more than the hire itself
      `.trim(),
      examples: '',
    },
  ],
};

// ─── 12 Ideas ─────────────────────────────────────────────────────────────────

const ALL_IDEAS = [
  // ── Compliance Pillar (8 ideas) ──────────────────────────────────────────
  {
    title: 'Why US startups discover GDPR compliance too late',
    category: 'gdpr compliance',
    description: 'Most founders only realize they need an EU Representative when a large enterprise customer asks for proof of compliance during procurement. By then they\'re already in scope and potentially liable for months of non-compliance.',
  },
  {
    title: 'GDPR, DSA, NIS2, AI Act: the one-slide breakdown every US founder needs',
    category: 'eu regulation',
    description: 'Practical breakdown of which EU regulations apply to which types of non-EU companies — SaaS, AI products, marketplaces, infrastructure providers. Most founders confuse GDPR (data) with DSA (content) and NIS2 (security).',
  },
  {
    title: 'The €20M fine most US startups don\'t know they\'re already exposed to',
    category: 'gdpr compliance',
    description: 'GDPR Article 27 requires non-EU companies processing EU personal data to appoint a local representative. Non-compliance = fines up to €20M or 4% of global turnover. Most founders have never heard of Article 27.',
  },
  {
    title: 'What an EU Representative actually does — and why it\'s not a lawyer',
    category: 'eu representative',
    description: 'EU Representatives act as the local point of contact for supervisory authorities and data subjects. It\'s a regulatory requirement, not legal counsel. Most companies confuse the two and overpay for law firm services.',
  },
  {
    title: '4 signals that tell a US startup it\'s time to get EU compliant',
    category: 'eu compliance checklist',
    description: 'Concrete triggers: (1) first EU paying customer, (2) collecting emails from EU users, (3) enterprise deal with GDPR clause, (4) investor due diligence asking about data compliance. Most founders wait for all four before acting.',
  },
  {
    title: 'The EU AI Act is coming. Here\'s what it means for US AI startups',
    category: 'ai act compliance',
    description: 'Non-EU AI companies deploying high-risk or general-purpose AI models in the EU must comply with the AI Act — including appointing an EU AI Representative. Most US AI startups aren\'t tracking this.',
  },
  {
    title: 'How to pass GDPR due diligence in your next enterprise deal',
    category: 'gdpr enterprise sales',
    description: 'EU enterprise customers require GDPR compliance documentation before signing. The checklist: EU Representative appointment certificate, privacy policy, data processing agreements, DSR workflow. Most US SaaS companies fail item 1.',
  },
  {
    title: 'One vendor for GDPR, DSA, NIS2 and AI Act — why fragmentation kills EU expansion',
    category: 'eu compliance platform',
    description: 'Companies managing EU compliance through separate vendors for each regulation spend 3x more and miss cross-regulation obligations. The case for a unified platform vs. piecemeal law firms.',
  },

  // ── Operations Pillar (4 ideas) ──────────────────────────────────────────
  {
    title: 'How to hire your first EU employee without opening an entity',
    category: 'eor employer of record',
    description: 'EOR vs entity setup comparison for US startups expanding to Europe. Entity takes 6+ months and $10K+ in legal fees. EOR takes 3 days and costs $427/month per employee. The decision framework by stage.',
  },
  {
    title: 'The contractor misclassification trap US startups fall into in Europe',
    category: 'contractor compliance europe',
    description: 'Hiring EU-based workers as independent contractors when they\'re legally employees exposes companies to back-taxes, social contributions, and fines. Germany, France, and Spain have strict reclassification rules. Contractor of Record solves this.',
  },
  {
    title: 'Building an EU team across 5 countries without 5 payroll providers',
    category: 'eu payroll operations',
    description: 'US startups scaling EU teams face the complexity of payroll compliance in each member state. EOR platforms cover all 27 EU countries under a single contract. The alternative: 5 local HR/legal firms, 5 contracts, 5 monthly invoices.',
  },
  {
    title: 'What investors ask about EU operations during Series A due diligence',
    category: 'eu expansion investor readiness',
    description: 'Investors increasingly ask: Do you have EU Representative appointments? How are your EU contractors classified? What\'s your GDPR compliance status? Companies without answers lose deal momentum. The pre-raise EU compliance checklist.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function generateBatch(ideas: typeof ALL_IDEAS, batchNum: number) {
  console.log(`\n📦 Batch ${batchNum} — ${ideas.map(i => `"${i.title.slice(0, 40)}..."`).join(', ')}`);

  const res = await fetch(`${SERVER}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ideas,
      isLeadMagnetWeek: false,
      creatorProfile: EU_PRESENCE_PROFILE,
    }),
  });

  if (!res.ok) {
    console.error(`❌ Batch ${batchNum} HTTP error:`, res.status, await res.text());
    return;
  }

  const json = await res.json() as { results: Array<Record<string, unknown>>; durationMs: number };

  for (const result of json.results) {
    if (!result.success) {
      console.error(`  ❌ "${result.ideaTitle}" failed:`, result.error);
      continue;
    }
    const post = (result.content as Record<string, unknown>).post as Record<string, unknown> | undefined;
    console.log(`  ✅ "${result.ideaTitle}"`);
    console.log(`     Format: ${result.format} | Pillar: ${result.pillar} | Score: ${result.criticScore}${result.rewrote ? ' (rewritten)' : ''}`);
    console.log(`     Supabase ID: ${result.supabasePostId ?? '—'}`);
    if (post?.hook) console.log(`     Hook: ${String(post.hook).slice(0, 80)}`);
  }

  console.log(`  ⏱  ${json.durationMs}ms`);
}

// ─── Run ─────────────────────────────────────────────────────────────────────

async function run() {
  if (!RUN_ALL) {
    // Single idea test (default)
    const idea = ALL_IDEAS[0];
    console.log(`\n🚀 Test mode — single idea: "${idea.title}"\n`);
    console.log('Tip: run with --all to generate all 12\n');

    const res = await fetch(`${SERVER}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ideas: [idea],
        isLeadMagnetWeek: false,
        creatorProfile: EU_PRESENCE_PROFILE,
      }),
    });

    if (!res.ok) { console.error('❌', res.status, await res.text()); process.exit(1); }

    const json = await res.json() as { results: Array<Record<string, unknown>>; durationMs: number };
    const result = json.results[0];
    const post = (result.content as Record<string, unknown>).post as Record<string, unknown> | undefined;

    if (!result.success) { console.error('❌ Failed:', result.error); process.exit(1); }

    console.log(`✅ Format: ${result.format} | Score: ${result.criticScore}${result.rewrote ? ' (rewritten)' : ''}`);
    console.log(`Supabase ID: ${result.supabasePostId ?? '—'}\n`);
    if (post) {
      console.log('── Hook ─────────────────────────────────────────');
      console.log(post.hook);
      console.log('\n── Body ─────────────────────────────────────────');
      console.log(post.body);
      if (post.slides) {
        console.log('\n── Slides ───────────────────────────────────────');
        for (const [i, s] of (post.slides as Array<{ heading: string; body: string }>).entries()) {
          console.log(`[${i + 1}] ${s.heading}\n    ${s.body}`);
        }
      }
      console.log('\n── Hashtags ─────────────────────────────────────');
      console.log((post.hashtags as string[]).join(' '));
    }
    console.log(`\n⏱  ${json.durationMs}ms`);
    return;
  }

  // Batch mode — all 12 ideas
  console.log(`\n🚀 Batch mode — generating all ${ALL_IDEAS.length} EU Presence posts\n`);
  const batches = chunk(ALL_IDEAS, 3);

  for (const [i, batch] of batches.entries()) {
    await generateBatch(batch, i + 1);
    if (i < batches.length - 1) {
      console.log('  ⏳ Waiting 3s before next batch...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\n✅ All done. Check Supabase: https://supabase.com/dashboard/project/zbbpgbfquqckrzdbsfzm/editor`);
}

run().catch(console.error);
