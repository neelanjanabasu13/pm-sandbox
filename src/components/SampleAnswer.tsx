import type { Question } from '../lib/supabase';

const sections = [
  ['framing', 'Frame the problem'],
  ['recommendation', 'Make the call'],
  ['rationale', 'Explain why'],
  ['metrics', 'Measure success'],
  ['tradeoff', 'Address the tradeoff'],
  ['validation', 'Validate and launch'],
] as const;

export default function SampleAnswer({ question }: { question: Question }) {
  const answer = question.sample_answer;
  if (!answer) return null;

  return (
    <details className="sketch-card">
      <summary className="font-hand text-xl font-bold cursor-pointer">
        Reveal sample answer
      </summary>
      <p className="font-body text-sm text-gray-dark mt-3">
        One illustrative approach, not an official company answer. Try your own answer first, then compare the reasoning. Figures in interview prompts are scenario assumptions.
      </p>
      <div className="space-y-4 mt-4">
        {sections.map(([key, label]) => (
          <section key={key}>
            <h3 className="font-hand text-lg font-bold">{label}</h3>
            <p className="font-body leading-relaxed">{answer[key]}</p>
          </section>
        ))}
      </div>
      {typeof question.source_metadata?.source_url === 'string' && (
        <p className="font-body text-sm mt-4">
          Question attribution: {' '}
          <a href={question.source_metadata.source_url} target="_blank" rel="noopener noreferrer" className="underline">
            {typeof question.source_metadata.source_name === 'string' ? question.source_metadata.source_name : 'Workbook source'}
          </a>
          . The sample answer was written for practice.
        </p>
      )}
    </details>
  );
}
