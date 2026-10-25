import { useEffect, useState, useRef } from "react";
import { supabase, type Question } from "../lib/supabase";
import { Sparkles, Search, ArrowRight, ChevronDown, ChevronRight, Shuffle, Layers, Zap, Globe, Twitter } from "lucide-react";

interface LandingPageProps {
  onStartSession: (q: Question) => void;
}

const TYPE_LABELS: Record<string, string> = {
  product_sense: "Product Sense",
  execution: "Execution",
  strategy: "Strategy",
};

const AI_COMPANIES = [
  "Anthropic",
  "OpenAI",
  "Google DeepMind",
  "Meta AI",
  "Mistral AI",
  "Hugging Face",
  "Cohere",
  "Scale AI",
  "xAI",
  "Perplexity",
  "Stability AI",
  "Inflection AI",
  "Adept",
  "Character.AI",
  "Runway",
];

const isAiCompany = (company: string | null | undefined): boolean => {
  if (!company) return false;
  const c = company.toLowerCase();
  return AI_COMPANIES.some((a) => c === a.toLowerCase())
    || /\b(anthropic|openai|deepmind|mistral|hugging|cohere|scale ai|\bxai\b|perplexity|stability|inflection|adept|character\.ai|runway)\b/i.test(c);
};

export default function LandingPage({ onStartSession }: LandingPageProps) {
  const [dailyQuestion, setDailyQuestion] = useState<Question | null>(null);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(5);
  const [drawing, setDrawing] = useState(false);
  const deckRef = useRef<Question[]>([]);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillRemaining, setBackfillRemaining] = useState<number | null>(null);

  const runBackfill = async () => {
    setBackfilling(true);
    setBackfillRemaining(null);
    try {
      let remaining = -1;
      while (remaining !== 0) {
        let batchRemaining: number | null = null;
        try {
          const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content-batch`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ limit: 5 }),
          });
          const data = await resp.json();
          if (resp.ok) {
            remaining = data.remaining ?? 0;
            batchRemaining = remaining;
          } else {
            console.error("[backfill] request failed:", data.error || resp.status);
          }
        } catch (err) {
          console.error("[backfill] fetch error:", err);
        }
        if (batchRemaining !== null) setBackfillRemaining(batchRemaining);
        await new Promise((r) => setTimeout(r, 1000));
      }
    } finally {
      setBackfilling(false);
    }
  };

  useEffect(() => {
    fetchDailyQuestion();
    fetchBank();
  }, []);

  const fetchDailyQuestion = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_daily", true)
      .order("daily_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) console.error("[daily] fetch error:", error.message);
    if (data) setDailyQuestion(data as Question);
  };

  const fetchBank = async () => {
    const pageSize = 1000;
    let allData: Question[] = [];
    let lastId: string | null = null;
    while (true) {
      let query = supabase
        .from("questions")
        .select("*")
        .order("id", { ascending: true })
        .limit(pageSize);
      if (lastId) query = query.gt("id", lastId);
      const { data, error } = await query;
      if (error) {
        console.error("[bank] fetch error:", error.message);
        break;
      }
      allData = allData.concat(data as Question[]);
      if (data.length < pageSize) break;
      lastId = data[data.length - 1].id;
    }
    setBankQuestions(allData);
    deckRef.current = allData;
    setLoading(false);
  };

  const drawNewCard = () => {
    if (drawing || deckRef.current.length === 0) return;
    setDrawing(true);

    let count = 0;
    const maxFlips = 12;
    const interval = setInterval(() => {
      const random = deckRef.current[Math.floor(Math.random() * deckRef.current.length)];
      setDailyQuestion(random);
      count++;
      if (count >= maxFlips) {
        clearInterval(interval);
        setDrawing(false);
      }
    }, 80);
  };

  const filteredBank = bankQuestions.filter((q) => {
    if (filterType === "ai" && !isAiCompany(q.source_company)) return false;
    if (["product_sense", "execution", "strategy"].includes(filterType) && q.type !== filterType) return false;
    if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by company
  const groupedByCompany: Record<string, Question[]> = {};
  filteredBank.forEach((q) => {
    const company = q.source_company || "Unknown";
    if (!groupedByCompany[company]) groupedByCompany[company] = [];
    groupedByCompany[company].push(q);
  });

  const sortedCompanies = Object.keys(groupedByCompany).sort((a, b) => {
    return groupedByCompany[b].length - groupedByCompany[a].length;
  });

  const toggleCompany = (company: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      return next;
    });
  };

  const toggleType = (company: string, type: string) => {
    const key = `${company}::${type}`;
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpandedCompanies(new Set(sortedCompanies));
  const collapseAll = () => {
    setExpandedCompanies(new Set());
    setExpandedTypes(new Set());
  };

  const visibleCompanies = sortedCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < sortedCompanies.length;

  useEffect(() => {
    setVisibleCount(5);
  }, [filterType, searchQuery]);

  return (
    <div className="space-y-8 fade-in">
      {/* ── Daily Question ─────────────────────────── */}
      {dailyQuestion && (
        <div className="relative">
          <div
            className={`sketch-card transition-all duration-300 ${drawing ? "scale-[0.97] rotate-[-1deg]" : ""}`}
            style={{ boxShadow: "4px 4px 0 var(--ink)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-hand text-xl font-bold">Today's Question</span>
              <span className="font-mono text-xs text-gray-mid ml-2">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={runBackfill}
                  disabled={backfilling}
                  className="btn-outline py-1 px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
                  title="Generate missing content for all questions"
                >
                  <Zap size={14} className={backfilling ? "animate-pulse" : ""} />
                  {backfilling
                    ? `${backfillRemaining !== null ? `${backfillRemaining} left` : "Starting..."}`
                    : "Backfill content"}
                </button>
                <button
                  onClick={drawNewCard}
                  disabled={drawing}
                  className="btn-outline py-1 px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
                  title="Draw a different question"
                >
                  {drawing ? <Shuffle size={14} className="animate-spin" /> : <Layers size={14} />}
                  {drawing ? "Drawing..." : "Draw a card"}
                </button>
              </div>
            </div>

            <div className={`transition-opacity duration-150 ${drawing ? "opacity-40" : "opacity-100"}`}>
              <p className="font-body text-xl leading-relaxed mb-4">{dailyQuestion.text}</p>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs border-2 border-ink px-2 py-0.5 rounded-sketch">
                    {TYPE_LABELS[dailyQuestion.type] ?? dailyQuestion.type}
                  </span>
                  {dailyQuestion.source_company && (
                    <span className="font-mono text-xs text-gray-dark">
                      {dailyQuestion.source_company}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onStartSession(dailyQuestion)}
                  className="btn-ink flex items-center gap-2"
                >
                  Start practicing
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Deck visual */}
          {drawing && (
            <div className="absolute -top-2 -right-2 pointer-events-none">
              <div className="flex -space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-14 border-2 border-ink bg-paper rounded-sketch"
                    style={{
                      transform: `rotate(${i * 5 - 5}deg) translateY(${-i * 2}px)`,
                      animation: `wiggle 0.3s ease infinite ${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Practice from the bank ─────────────────── */}
      <div>
        <h3 className="font-hand text-2xl font-bold mb-1">Practice from the bank</h3>
        <p className="font-mono text-xs text-gray-mid mb-4">
          {filteredBank.length} questions across {sortedCompanies.length} companies
        </p>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterType("all")}
            className={`chip ${filterType === "all" ? "chip-selected" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("product_sense")}
            className={`chip ${filterType === "product_sense" ? "chip-selected" : ""}`}
          >
            Product Sense
          </button>
          <button
            onClick={() => setFilterType("execution")}
            className={`chip ${filterType === "execution" ? "chip-selected" : ""}`}
          >
            Execution
          </button>
          <button
            onClick={() => setFilterType("strategy")}
            className={`chip ${filterType === "strategy" ? "chip-selected" : ""}`}
          >
            Strategy
          </button>
          <button
            onClick={() => setFilterType("ai")}
            className={`chip ${filterType === "ai" ? "chip-selected" : ""}`}
          >
            AI
          </button>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-mid" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sketch-input pl-9"
            />
          </div>
        </div>

        {/* Expand/collapse all */}
        {sortedCompanies.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button onClick={expandAll} className="font-mono text-xs text-gray-dark hover:text-ink underline">
              Expand all
            </button>
            <span className="text-gray-mid">/</span>
            <button onClick={collapseAll} className="font-mono text-xs text-gray-dark hover:text-ink underline">
              Collapse all
            </button>
          </div>
        )}

        {/* Company groups */}
        {loading ? (
          <p className="font-body text-gray-mid">Loading questions...</p>
        ) : (
          <div className="space-y-2">
            {visibleCompanies.map((company) => {
              const questions = groupedByCompany[company];
              const isExpanded = expandedCompanies.has(company);
              return (
                <div key={company} className="sketch-border overflow-hidden">
                  <button
                    onClick={() => toggleCompany(company)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-paper-dark hover:bg-gray-light transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                      />
                      <span className="font-hand text-lg font-bold">{company}</span>
                      <span className="font-mono text-xs text-gray-mid">({questions.length})</span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 py-2 fade-in space-y-2">
                      {(() => {
                        const byType: Record<string, Question[]> = {};
                        questions.forEach((q) => {
                          const t = q.type || "other";
                          if (!byType[t]) byType[t] = [];
                          byType[t].push(q);
                        });
                        const typeOrder = ["product_sense", "execution", "strategy", "other"];
                        const types = Object.keys(byType).sort(
                          (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
                        );
                        return types.map((type) => {
                          const typeQuestions = byType[type];
                          const typeKey = `${company}::${type}`;
                          const isTypeExpanded = expandedTypes.has(typeKey);
                          return (
                            <div key={type} className="rounded-sketch border border-gray-light/60 overflow-hidden">
                              <button
                                onClick={() => toggleType(company, type)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-paper-dark transition-colors text-left"
                              >
                                <div className="flex items-center gap-1.5">
                                  {isTypeExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-mid" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-gray-mid" />
                                  )}
                                  <span className="font-mono text-xs font-bold uppercase tracking-wide text-gray-dark">
                                    {TYPE_LABELS[type] ?? type}
                                  </span>
                                  <span className="font-mono text-xs text-gray-mid">({typeQuestions.length})</span>
                                </div>
                              </button>
                              {isTypeExpanded && (
                                <div className="space-y-1 px-2 pb-2 fade-in">
                                  {typeQuestions.map((q) => (
                                    <button
                                      key={q.id}
                                      onClick={() => onStartSession(q)}
                                      className="w-full text-left px-3 py-2 hover:bg-paper-dark rounded-sketch transition-colors group"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-body text-sm leading-relaxed">{q.text}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-mid flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
            {sortedCompanies.length === 0 && (
              <p className="font-body text-gray-mid text-center py-8">
                No questions match your search.
              </p>
            )}
            {hasMore && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setVisibleCount((c) => c + 5)}
                  className="btn-outline flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  See more
                </button>
                <button
                  onClick={() => setVisibleCount(sortedCompanies.length)}
                  className="font-mono text-xs text-gray-dark hover:text-ink underline"
                >
                  See all ({sortedCompanies.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t-2 border-ink/10 mt-16 pt-6 pb-8">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-body text-sm text-gray-dark">Made by Neelanjana Basu</span>
          <a
            href="https://neelanjanabasu.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-mid hover:text-ink transition-colors"
            aria-label="Portfolio"
          >
            <Globe className="w-4 h-4" />
          </a>
          <a
            href="https://x.com/nee13njana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-mid hover:text-ink transition-colors"
            aria-label="X (Twitter)"
          >
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  );
}
