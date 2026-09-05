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

export async function analyzeSituation(payload) {
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return demoResult;
  }

  const response = await fetch('http://localhost:5000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('The receipts could not be fetched.');
  return response.json();
}
