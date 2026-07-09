import { query } from '@anthropic-ai/claude-agent-sdk';
import { getGraph } from './vault.js';
import { storeFile } from './files.js';
import type { Step, ChatContext, ChatRequest, ChatResponse } from '@/src/types.js';

export function buildGraphContext(step: Step, context: ChatContext): string {
  const graph = getGraph();
  const lines: string[] = [];

  if (step === 'technique' && context.domain) {
    lines.push(`Available testing techniques for domain "${context.domain}":`);
    graph.forEachNode((slug, attrs) => {
      const a = attrs as { type: string; name: string; domains: string[] };
      if (a.type === 'technique' && a.domains.includes(context.domain!)) {
        lines.push(`- ${a.name} (slug: ${slug})`);
      }
    });
  }

  if (step === 'tool' && context.technique && graph.hasNode(context.technique)) {
    lines.push(`Available tools for technique "${context.technique}":`);
    const neighborSlugs = new Set(graph.neighbors(context.technique));
    graph.forEachNode((slug, attrs) => {
      const a = attrs as { type: string; name: string; domains: string[] };
      if (a.type === 'tool' && neighborSlugs.has(slug)) {
        lines.push(`- ${a.name} (slug: ${slug})`);
      }
    });
  }

  return lines.length > 1 ? lines.join('\n') : 'No specific context available for this step.';
}

const STEP_INSTRUCTIONS: Record<Step, string> = {
  intake: `Ask 1-2 focused clarifying questions to understand: (1) the domain (web/api/mobile/performance), (2) the tech stack, and (3) any constraints. When you have enough context to recommend a technique, end your message with: READY_TO_ADVANCE`,
  technique: `Recommend ONE primary testing technique from your knowledge base. State the technique name clearly, explain in 2-3 sentences why it fits the problem, and mention any runner-up. End with: "Does this approach work for you?" followed by READY_TO_ADVANCE`,
  'test-cases': `Generate 4-6 concrete test cases using the chosen technique and problem context. Use Given/When/Then format. Be specific — include realistic inputs and expected outputs. End with: "Ready to pick a tool?" followed by READY_TO_ADVANCE`,
  tool: `Recommend 1-2 tools from your knowledge base that match the technique and tech stack. For each tool: name, one-sentence rationale, key strength. If recommending two, state which you prefer and why. End with: "Should I generate the automation code?" followed by READY_TO_ADVANCE`,
  code: `Generate a complete, runnable test file using the chosen tool. Include: all necessary imports, test setup, the exact test cases from the previous step, and teardown. Use idiomatic patterns for the tool. Add brief inline comments for non-obvious steps. IMPORTANT: Respond with ONLY the code file content — no explanation before or after.`,
};

export function buildSystemPrompt(step: Step, graphContext: string): string {
  return `You are a QA advisor for a software engineering team.
Your knowledge base covers Web, API, Mobile, and Performance testing.
Current conversation step: ${step}

Knowledge base context:
${graphContext}

${STEP_INSTRUCTIONS[step]}

Never advance to the next step without the user confirming.`;
}

function detectReadyToAdvance(content: string): { clean: string; ready: boolean } {
  const ready = content.includes('READY_TO_ADVANCE');
  return { clean: content.replaceAll('READY_TO_ADVANCE', '').trim(), ready };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getCodeExtension(tool: string): string {
  const ext: Record<string, string> = { playwright: 'ts', appium: 'ts', k6: 'js', postman: 'json', detox: 'ts' };
  return ext[tool] ?? 'ts';
}

function buildPrompt(messages: ChatRequest['messages']): string {
  if (messages.length === 1) return messages[0].content;
  const history = messages.slice(0, -1)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
  return `${history}\n\nUser: ${messages[messages.length - 1].content}`;
}

function stripCodeFences(content: string): string {
  return content.replace(/^```[\w]*\n([\s\S]*?)\n```$/m, '$1').trim();
}

export async function handleChat(req: ChatRequest): Promise<ChatResponse> {
  const graphContext = buildGraphContext(req.step, req.context);
  const systemPrompt = buildSystemPrompt(req.step, graphContext);
  const prompt = buildPrompt(req.messages);

  let raw = '';
  for await (const msg of query({ prompt, options: { systemPrompt, maxTurns: 1, tools: [] } })) {
    if (msg.type === 'assistant') {
      if (msg.error) throw new Error(`Claude error: ${msg.error}`);
      for (const block of msg.message?.content ?? []) {
        if (block.type === 'text') raw += (block as { type: 'text'; text: string }).text;
      }
    }
  }

  if (!raw) throw new Error('No response from Claude');

  const { clean, ready } = detectReadyToAdvance(raw);

  let file: { id: string; name: string } | undefined;

  if (req.step === 'test-cases') {
    const problemSlug = slugify(req.messages[0]?.content.slice(0, 40) ?? 'test-cases');
    const id = storeFile(`test-cases-${problemSlug}.md`, `# Test Cases\n\n${clean}`, 'text/markdown');
    file = { id, name: `test-cases-${problemSlug}.md` };
  }

  if (req.step === 'code' && req.context.tool) {
    const ext = getCodeExtension(req.context.tool);
    const name = `tests.${ext}`;
    const id = storeFile(name, stripCodeFences(clean), 'text/plain');
    file = { id, name };
  }

  return { content: clean, readyToAdvance: ready, file };
}
