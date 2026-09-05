const DEMO_MODE = true;

const demoResult = {
  warning: 'HIGH',
  negative_cases: 4,
  total_similar_cases: 5,
  negative_ratio: 0.8,
  common_pattern: 'ghosting_after_yes',
  pattern_frequency: 3,
  similar_cases: [
    { case_id: 'G034', similarity: 91.2, pattern: 'ghosting_after_yes', outcome: 'ghosted' },
    { case_id: 'G061', similarity: 87.4, pattern: 'ghosting_after_yes', outcome: 'ghosted' },
    { case_id: 'G012', similarity: 84.1, pattern: 'mixed_signals', outcome: 'rejected' },
    { case_id: 'G088', similarity: 80.8, pattern: 'one_sided_effort', outcome: 'not_available' },
    { case_id: 'G103', similarity: 76.5, pattern: 'ghosting_after_yes', outcome: 'ghosted' },
  ],
};

function localAnalysis(payload) {
  const concernCount = [payload.reply_change !== 'Consistent', payload.reciprocity !== 'Equal', payload.mixed_signals === 'YES', payload.he_increased_pursuit === 'Yes', payload.relationship_status === 'Dating someone'].filter(Boolean).length;
  const warning = concernCount >= 3 ? 'HIGH' : concernCount >= 1 ? 'MEDIUM' : 'LOW';
  const commonPattern = payload.reply_change === 'Randomly disappears' ? 'ghosting_after_yes' : payload.reciprocity !== 'Equal' ? 'one_sided_effort' : payload.mixed_signals === 'YES' ? 'mixed_signals' : 'hot_and_cold';
  return { ...demoResult, warning, negative_cases: warning === 'HIGH' ? 4 : warning === 'MEDIUM' ? 3 : 1, negative_ratio: warning === 'HIGH' ? .8 : warning === 'MEDIUM' ? .6 : .2, common_pattern: commonPattern, pattern_frequency: warning === 'LOW' ? 2 : 3 };
}

export async function analyzeSituation(payload) {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return localAnalysis(payload);
  }
  try {
    const response = await fetch('http://localhost:5000/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('analysis unavailable');
    return response.json();
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return localAnalysis(payload);
  }
}
