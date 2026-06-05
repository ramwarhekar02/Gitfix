const { OpenAI } = require('openai');

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Perform AI Merge Conflict Resolution
 * @param {string} baseCode
 * @param {string} branchA
 * @param {string} branchB
 * @returns {Promise<{mergedCode: string, risk: number, reason: string}>}
 */
const runAiMerge = async (baseCode, branchA, branchB) => {
  if (!openai) {
    console.log('OpenAI API Key not configured. Using rule-based fallback merger.');
    return runFallbackMerge(baseCode, branchA, branchB);
  }

  const systemPrompt = `You are a Git merge conflict resolution engine.
Your task is to merge code from Branch A and Branch B, resolving conflicts cleanly using Base code as context.
You must reply ONLY with a valid JSON object matching the following structure:
{
  "mergedCode": "string",
  "risk": 0-100,
  "reason": "string"
}
Do not return any explanation outside of the JSON object. Keep explanation very precise on to point and brief.`;

  const userPrompt = `Base Code:
\`\`\`
${baseCode}
\`\`\`

Branch A Code:
\`\`\`
${branchA}
\`\`\`

Branch B Code:
\`\`\`
${branchB}
\`\`\`
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    return {
      mergedCode: result.mergedCode || '',
      risk: typeof result.risk === 'number' ? result.risk : 50,
      reason: result.reason || 'Resolved via AI',
    };
  } catch (error) {
    console.error('Error in OpenAI AI Merge service:', error);
    return runFallbackMerge(baseCode, branchA, branchB);
  }
};

/**
 * Fallback line-by-line mechanical merge conflict resolver
 */
function runFallbackMerge(baseCode, branchA, branchB) {
  // Simple three-way or two-way diff strategy for line-by-line fallback
  const linesBase = baseCode.split('\n');
  const linesA = branchA.split('\n');
  const linesB = branchB.split('\n');

  // Let's create a simple merge logic. If Branch A and Branch B both differ from Base, mark conflicts.
  // Otherwise, if only one differs, take that change.
  // To keep it robust & simple for fallback:
  let mergedLines = [];
  let indexA = 0;
  let indexB = 0;

  while (indexA < linesA.length || indexB < linesB.length) {
    if (indexA < linesA.length && indexB < linesB.length) {
      if (linesA[indexA] === linesB[indexB]) {
        mergedLines.push(linesA[indexA]);
        indexA++;
        indexB++;
      } else {
        // Simple conflict block construction
        mergedLines.push('<<<<<<< BRANCH_A');
        mergedLines.push(linesA[indexA]);
        mergedLines.push('=======');
        mergedLines.push(linesB[indexB]);
        mergedLines.push('>>>>>>> BRANCH_B');
        indexA++;
        indexB++;
      }
    } else if (indexA < linesA.length) {
      mergedLines.push(linesA[indexA]);
      indexA++;
    } else if (indexB < linesB.length) {
      mergedLines.push(linesB[indexB]);
      indexB++;
    }
  }

  return {
    mergedCode: mergedLines.join('\n'),
    risk: 75, // Higher risk since it's a fallback merge with manual conflict tags
    reason: 'Fallback rule-based merge applied due to OpenAI API key absence or rate limit.',
  };
}

module.exports = { runAiMerge };
