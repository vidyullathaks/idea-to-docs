import { Client } from '@notionhq/client';
import type { Prd, UserStory } from '@shared/schema';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

async function getUncachableNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

export async function searchNotionPages(query?: string) {
  const notion = await getUncachableNotionClient();
  const response = await notion.search({
    query: query || '',
    filter: { property: 'object', value: 'page' },
    page_size: 20,
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties?.title?.title?.[0]?.plain_text
      || page.properties?.Name?.title?.[0]?.plain_text
      || 'Untitled',
    icon: page.icon?.emoji || null,
    url: page.url,
  }));
}

function textBlock(content: string) {
  const chunks = [];
  for (let i = 0; i < content.length; i += 2000) {
    chunks.push({ type: 'text' as const, text: { content: content.substring(i, i + 2000) } });
  }
  return chunks;
}

function heading2(text: string) {
  return {
    object: 'block' as const,
    type: 'heading_2' as const,
    heading_2: { rich_text: textBlock(text) },
  };
}

function heading3(text: string) {
  return {
    object: 'block' as const,
    type: 'heading_3' as const,
    heading_3: { rich_text: textBlock(text) },
  };
}

function paragraph(text: string) {
  return {
    object: 'block' as const,
    type: 'paragraph' as const,
    paragraph: { rich_text: textBlock(text) },
  };
}

function bulletItem(text: string) {
  return {
    object: 'block' as const,
    type: 'bulleted_list_item' as const,
    bulleted_list_item: { rich_text: textBlock(text) },
  };
}

function dividerBlock() {
  return { object: 'block' as const, type: 'divider' as const, divider: {} };
}

export async function exportPrdToNotion(prd: Prd, parentPageId: string): Promise<string> {
  const notion = await getUncachableNotionClient();
  const userStories = (prd.userStories as UserStory[]) || [];
  const blocks: any[] = [];

  if (prd.problemStatement) {
    blocks.push(heading2('Problem Statement'));
    blocks.push(paragraph(prd.problemStatement));
  }

  if (prd.targetAudience) {
    blocks.push(heading2('Target Audience'));
    blocks.push(paragraph(prd.targetAudience));
  }

  if (prd.goals?.length) {
    blocks.push(heading2('Goals & Objectives'));
    prd.goals.forEach(g => blocks.push(bulletItem(g)));
  }

  if (prd.features?.length) {
    blocks.push(heading2('Key Features'));
    prd.features.forEach(f => blocks.push(bulletItem(f)));
  }

  if (prd.successMetrics?.length) {
    blocks.push(heading2('Success Metrics'));
    prd.successMetrics.forEach(m => blocks.push(bulletItem(m)));
  }

  if (prd.outOfScope?.length) {
    blocks.push(heading2('Out of Scope'));
    prd.outOfScope.forEach(o => blocks.push(bulletItem(o)));
  }

  if (prd.assumptions?.length) {
    blocks.push(heading2('Assumptions'));
    prd.assumptions.forEach(a => blocks.push(bulletItem(a)));
  }

  if (userStories.length > 0) {
    blocks.push(heading2('User Stories'));
    userStories.forEach((story, index) => {
      blocks.push(heading3(`US-${String(index + 1).padStart(3, '0')}: ${story.title}`));
      blocks.push(paragraph(`Priority: ${story.priority}\n\n${story.description}`));
      if (story.acceptanceCriteria?.length) {
        story.acceptanceCriteria.forEach(ac => blocks.push(bulletItem(ac)));
      }
    });
  }

  const limitedBlocks = blocks.slice(0, 100);

  const page = await notion.pages.create({
    parent: { page_id: parentPageId },
    icon: { type: 'emoji', emoji: '📋' },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: prd.title || 'Product Requirements Document' } }],
      },
    },
    children: limitedBlocks,
  });

  return (page as any).url;
}

export async function exportToolResultToNotion(
  title: string,
  toolType: string,
  rawInput: string,
  result: Record<string, unknown>,
  parentPageId: string,
): Promise<string> {
  const notion = await getUncachableNotionClient();
  const blocks: any[] = [];

  blocks.push(paragraph(`Tool: ${toolType}\nInput: ${rawInput}`));
  blocks.push(dividerBlock());

  switch (toolType) {
    case 'user-stories': {
      const stories = (result.userStories as any[]) || [];
      stories.forEach((s, i) => {
        blocks.push(heading3(`US-${String(i + 1).padStart(3, '0')}: ${s.title}`));
        blocks.push(paragraph(`Priority: ${s.priority}\n\n${s.description}`));
        if (s.acceptanceCriteria?.length) {
          s.acceptanceCriteria.forEach((ac: string) => blocks.push(bulletItem(ac)));
        }
        if (s.edgeCases?.length) {
          blocks.push(paragraph('Edge Cases:'));
          s.edgeCases.forEach((e: string) => blocks.push(bulletItem(e)));
        }
      });
      break;
    }
    case 'problem-refiner': {
      if (result.originalProblem) { blocks.push(heading2('Original Problem')); blocks.push(paragraph(String(result.originalProblem))); }
      if (result.refinedStatement) { blocks.push(heading2('Refined Statement')); blocks.push(paragraph(String(result.refinedStatement))); }
      if (result.context) { blocks.push(heading2('Context')); blocks.push(paragraph(String(result.context))); }
      if (result.impact) { blocks.push(heading2('Impact')); blocks.push(paragraph(String(result.impact))); }
      if (result.affectedUsers) { blocks.push(heading2('Affected Users')); blocks.push(paragraph(String(result.affectedUsers))); }
      if (result.currentSolutions) { blocks.push(heading2('Current Solutions')); blocks.push(paragraph(String(result.currentSolutions))); }
      if (result.proposedApproach) { blocks.push(heading2('Proposed Approach')); blocks.push(paragraph(String(result.proposedApproach))); }
      if ((result.successCriteria as string[])?.length) {
        blocks.push(heading2('Success Criteria'));
        (result.successCriteria as string[]).forEach(c => blocks.push(bulletItem(c)));
      }
      break;
    }
    case 'feature-prioritizer': {
      const features = (result.features as any[]) || [];
      features.forEach(f => {
        blocks.push(heading3(f.name));
        blocks.push(paragraph(`RICE Score: ${f.riceScore} | Recommendation: ${f.recommendation}\nReach: ${f.reach} | Impact: ${f.impact} | Confidence: ${f.confidence} | Effort: ${f.effort}`));
        if (f.reasoning) blocks.push(paragraph(`Reasoning: ${f.reasoning}`));
        if (f.tradeoffs) blocks.push(paragraph(`Tradeoffs: ${f.tradeoffs}`));
      });
      if (result.summary) { blocks.push(heading2('Summary')); blocks.push(paragraph(String(result.summary))); }
      break;
    }
    case 'sprint-planner': {
      if (result.sprintGoal) { blocks.push(heading2('Sprint Goal')); blocks.push(paragraph(String(result.sprintGoal))); }
      if (result.duration || result.capacity || result.totalPoints) {
        blocks.push(paragraph(`Duration: ${result.duration || 'N/A'} | Capacity: ${result.capacity || 'N/A'} | Total Points: ${result.totalPoints || 'N/A'}`));
      }
      const stories = (result.stories as any[]) || [];
      if (stories.length) {
        blocks.push(heading2('Stories'));
        stories.forEach(s => blocks.push(bulletItem(`${s.title} (${s.storyPoints} pts, ${s.priority})`)));
      }
      const risks = (result.risks as any[]) || [];
      if (risks.length) {
        blocks.push(heading2('Risks'));
        risks.forEach(rk => blocks.push(bulletItem(`${rk.risk} (${rk.severity}) — ${rk.mitigation}`)));
      }
      const recs = (result.recommendations as string[]) || [];
      if (recs.length) {
        blocks.push(heading2('Recommendations'));
        recs.forEach(rc => blocks.push(bulletItem(rc)));
      }
      break;
    }
    case 'interview-prep': {
      if (result.question) { blocks.push(heading2('Question')); blocks.push(paragraph(String(result.question))); }
      if (result.framework) blocks.push(paragraph(`Framework: ${result.framework}`));
      if (result.structuredAnswer) { blocks.push(heading2('Structured Answer')); blocks.push(paragraph(String(result.structuredAnswer))); }
      if ((result.keyPoints as string[])?.length) {
        blocks.push(heading2('Key Points'));
        (result.keyPoints as string[]).forEach(p => blocks.push(bulletItem(p)));
      }
      if (result.exampleScenario) { blocks.push(heading2('Example Scenario')); blocks.push(paragraph(String(result.exampleScenario))); }
      if ((result.followUpQuestions as string[])?.length) {
        blocks.push(heading2('Follow-up Questions'));
        (result.followUpQuestions as string[]).forEach(q => blocks.push(bulletItem(q)));
      }
      if ((result.tips as string[])?.length) {
        blocks.push(heading2('Tips'));
        (result.tips as string[]).forEach(t => blocks.push(bulletItem(t)));
      }
      if (result.feedback) { blocks.push(heading2('Feedback')); blocks.push(paragraph(String(result.feedback))); }
      break;
    }
  }

  const limitedBlocks = blocks.slice(0, 100);

  const emojiMap: Record<string, string> = {
    'user-stories': '📖',
    'problem-refiner': '🎯',
    'feature-prioritizer': '📊',
    'sprint-planner': '📅',
    'interview-prep': '🎓',
  };

  const page = await notion.pages.create({
    parent: { page_id: parentPageId },
    icon: { type: 'emoji', emoji: (emojiMap[toolType] || '📝') as any },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: title } }],
      },
    },
    children: limitedBlocks,
  });

  return (page as any).url;
}
