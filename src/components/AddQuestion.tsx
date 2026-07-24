import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Plus, X, CheckCircle } from "lucide-react";

const QUESTION_TYPES = [
  { value: "product_sense", label: "Product Sense" },
  { value: "execution", label: "Execution" },
  { value: "strategy", label: "Strategy" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AddQuestion({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [company, setCompany] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState("product_sense");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!company.trim() || !questionText.trim()) {
      setError("Company and question are required.");
      return;
    }

    setSubmitting(true);
    const interviewDate = month && year ? `${month} ${year}` : null;

    const { error: insertError } = await supabase.from("questions").insert({
      text: questionText.trim(),
      type,
      source_company: company.trim(),
      job_title: jobTitle.trim() || null,
      interview_date: interviewDate,
      submitted_by: user?.id,
      difficulty: "medium",
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="sketch-card max-w-md w-full mx-4 text-center py-8" onClick={(e) => e.stopPropagation()}>
          <CheckCircle size={48} className="mx-auto mb-3" />
          <h3 className="font-hand text-2xl font-bold mb-1">Question added!</h3>
          <p className="font-body text-sm text-gray-mid">Thanks for contributing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="sketch-card max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-hand text-2xl font-bold">Add a Question</h3>
          <button onClick={onClose} className="hover:bg-paper-dark p-1 rounded-sketch">
            <X size={20} />
          </button>
        </div>

        <p className="font-body text-sm text-gray-mid mb-4">
          Share a question you were asked in an interview. It'll be added to the practice pool.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Company">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Meta, Google, Stripe"
              className="input-field"
              required
            />
          </Field>

          <Field label="What was the interview question?">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Paste the full question here..."
              rows={4}
              className="input-field resize-none"
              required
            />
          </Field>

          <Field label="Question Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Interview Month">
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field">
                <option value="">Select...</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <select value={year} onChange={(e) => setYear(e.target.value)} className="input-field">
                <option value="">Select...</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Job Title">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Product Manager, PMM"
              className="input-field"
            />
          </Field>

          {error && (
            <p className="font-mono text-xs text-red-600 border-2 border-red-600 px-3 py-2 rounded-sketch">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-ink w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus size={18} />
            {submitting ? "Adding..." : "Add Question"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs font-bold uppercase tracking-wide text-gray-dark mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}
