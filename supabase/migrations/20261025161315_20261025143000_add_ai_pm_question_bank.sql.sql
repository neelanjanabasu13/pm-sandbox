/*
# Add AI PM Question Bank — 144 new AI-company PM interview questions

## Summary
Inserts 144 new AI-company product management interview questions into the `questions` table,
bringing the total AI question count to 167 (35 Anthropic, 20 OpenAI, 14 Google DeepMind,
12 Meta AI, 10 each for Mistral/Hugging Face/Cohere/Scale AI/xAI, 8 each for Perplexity/Stability AI,
5 each for Inflection AI/Adept/Character.AI/Runway).

Each question includes complete interactive practice stages stored in `chip_options`:
- Framing MCQs for context setting
- Stage-specific items (segments/pains/solutions/metrics for product_sense;
  hypotheses/metrics for execution; options for strategy)
- A sample answer for reference

## Changes
- No schema changes (uses existing `questions` table)
- 144 new rows inserted into `questions`
- Each row has `chip_options` populated with AI-themed interactive content
- `source_company` set to the AI company name
- No RLS or policy changes (existing policies apply)

## Data Safety
- No existing questions or sessions are modified or deleted
- All inserts are additive
- Practice history (sessions, session_responses) is preserved
- Idempotent: uses WHERE NOT EXISTS so re-running does not duplicate
*/

-- Drop helper function if it exists from a previous run
DROP FUNCTION IF EXISTS gen_ai_chip_options(text);

-- Create a helper function that generates AI-themed interactive content per question type
CREATE OR REPLACE FUNCTION gen_ai_chip_options(q_type text) RETURNS jsonb AS $func$
DECLARE
  ps_framing jsonb;
  ps_stages jsonb;
  ps_sample text;
  exec_framing jsonb;
  exec_stages jsonb;
  exec_sample text;
  strat_framing jsonb;
  strat_stages jsonb;
  strat_sample text;
BEGIN
  -- ── Product Sense content ──
  ps_framing := jsonb_build_array(
    jsonb_build_object('id','f1','prompt','What is the primary goal?','options',jsonb_build_array('Maximize user adoption','Maximize engagement / retention','Maximize revenue','Build a competitive moat')),
    jsonb_build_object('id','f2','prompt','Who is the primary user we should focus on?','options',jsonb_build_array('AI developers','Enterprise knowledge workers','AI researchers','SMB owners')),
    jsonb_build_object('id','f3','prompt','What scope should we set for this round?','options',jsonb_build_array('Focus on the core use case only','Focus on acquisition funnel','End-to-end: acquisition through retention','Focus on monetization'))
  );

  ps_stages := jsonb_build_object(
    'segments', jsonb_build_array(
      jsonb_build_object('id','s1','name','AI developers','desc','Engineers building AI-powered products who need reliable model outputs and APIs.'),
      jsonb_build_object('id','s2','name','Enterprise knowledge workers','desc','Non-technical staff using AI assistants for daily productivity and decision support.'),
      jsonb_build_object('id','s3','name','AI researchers','desc','Academic and industry researchers using AI tools for analysis, literature review, and experimentation.'),
      jsonb_build_object('id','s4','name','SMB owners','desc','Small business owners leveraging AI for cost-efficient operations and customer engagement.')
    ),
    'pains', jsonb_build_array(
      jsonb_build_object('id','p_s1_1','name','Unpredictable output quality','desc','AI developers cannot predict when models will produce low-quality or hallucinated outputs.'),
      jsonb_build_object('id','p_s1_2','name','High API costs at scale','desc','API costs grow with usage, making large-scale deployment prohibitively expensive.'),
      jsonb_build_object('id','p_s2_1','name','Difficulty trusting AI outputs','desc','Enterprise users hesitate to rely on AI for critical decisions without manual verification.'),
      jsonb_build_object('id','p_s2_2','name','Steep learning curve for prompting','desc','Knowledge workers struggle to write effective prompts and use AI tools to their full potential.'),
      jsonb_build_object('id','p_s3_1','name','No reproducibility','desc','Researchers cannot reproduce AI outputs reliably, undermining scientific workflows.'),
      jsonb_build_object('id','p_s3_2','name','Limited context windows','desc','Researchers need to analyze long documents but models have context length limits.'),
      jsonb_build_object('id','p_s4_1','name','Cost vs value uncertainty','desc','SMB owners are not sure if AI tools justify their monthly subscription costs.'),
      jsonb_build_object('id','p_s4_2','name','Integration complexity','desc','SMB owners lack technical resources to integrate AI into their existing business workflows.')
    ),
    'solutions', jsonb_build_array(
      jsonb_build_object('id','sol1','name','Confidence scoring','desc','Display confidence scores on AI outputs so users know when to verify versus trust.','painTags',jsonb_build_array('p_s1_1','p_s2_1')),
      jsonb_build_object('id','sol2','name','Tiered pricing with volume discounts','desc','Offer usage-based pricing with volume discounts to reduce cost barriers at scale.','painTags',jsonb_build_array('p_s1_2','p_s4_1')),
      jsonb_build_object('id','sol3','name','Guided prompt builder','desc','Interactive UI that helps users construct effective prompts with templates and suggestions.','painTags',jsonb_build_array('p_s2_2','p_s4_2')),
      jsonb_build_object('id','sol4','name','Citation and source linking','desc','Attach source references to AI-generated claims for verifiability and trust.','painTags',jsonb_build_array('p_s1_1','p_s2_1','p_s3_1')),
      jsonb_build_object('id','sol5','name','Long-document summarization API','desc','Specialized endpoint for long-document analysis with chunking and synthesis.','painTags',jsonb_build_array('p_s3_2')),
      jsonb_build_object('id','sol6','name','No-code integration builder','desc','Drag-and-drop tool to connect AI capabilities to existing business tools without coding.','painTags',jsonb_build_array('p_s4_2','p_s2_2'))
    ),
    'metrics', jsonb_build_array(
      jsonb_build_object('id','m1','name','Weekly active users','desc','Unique users interacting with the AI tool each week.'),
      jsonb_build_object('id','m2','name','Task completion rate','desc','Percentage of sessions where users complete their intended task using AI.'),
      jsonb_build_object('id','m3','name','Guardrail: hallucination rate','desc','Track the frequency of factually incorrect outputs to ensure quality does not degrade.'),
      jsonb_build_object('id','m4','name','Revenue per user','desc','Average revenue generated per active user, indicating monetization efficiency.')
    )
  );

  ps_sample := 'Target enterprise knowledge workers who hesitate to trust AI outputs. The core pain is difficulty trusting AI for critical decisions — solve this with confidence scoring and citation linking. Confidence scores are lightweight to build and directly address trust. North star: task completion rate (are users actually finishing their work with AI?). Guardrail: keep hallucination rate below 2%.';

  -- ── Execution content ──
  exec_framing := jsonb_build_array(
    jsonb_build_object('id','f1','prompt','What is the core hypothesis we need to validate?','options',jsonb_build_array('Users will adopt the new feature','The feature drives the target metric','The feature will not harm existing metrics','We can build and ship it fast enough')),
    jsonb_build_object('id','f2','prompt','What is the biggest risk?','options',jsonb_build_array('Low user adoption','Cannibalizing existing behavior','Technical complexity or delay','Negative impact on a guardrail metric'))
  );

  exec_stages := jsonb_build_object(
    'hypotheses', jsonb_build_array(
      jsonb_build_object('id','h1','name','Users will adopt the feature','desc','A meaningful percentage of target users try it within the first week of launch.'),
      jsonb_build_object('id','h2','name','The feature moves the primary metric','desc','Adoption translates into the business outcome we care about.'),
      jsonb_build_object('id','h3','name','No regression on guardrail metrics','desc','The feature does not hurt retention, latency, or user satisfaction.'),
      jsonb_build_object('id','h4','name','We can ship a credible version quickly','desc','An MVP can be built and tested within the target window.')
    ),
    'metrics', jsonb_build_array(
      jsonb_build_object('id','m1','name','Adoption rate','desc','Percentage of target users who use the feature at least once.'),
      jsonb_build_object('id','m2','name','Retention lift','desc','Difference in retention between users who engage with the feature and those who do not.'),
      jsonb_build_object('id','m3','name','Time-to-first-use','desc','How long after launch a user first interacts with the feature.'),
      jsonb_build_object('id','m4','name','Guardrail: latency stability','desc','Ensure response times do not regress during and after the feature rollout.')
    )
  );

  exec_sample := 'Commit to validating adoption first — if users do not try the feature, nothing else matters. Ship a minimal version within two weeks. Track adoption rate as the primary metric with a 10% target. Guardrail: keep p95 latency under 2 seconds. If adoption falls below 5% after two weeks, kill the feature and pivot.';

  -- ── Strategy content ──
  strat_framing := jsonb_build_array(
    jsonb_build_object('id','f1','prompt','What market are we evaluating?','options',jsonb_build_array('Adjacent market to current users','New geographic market','New vertical or use case','New platform or distribution channel')),
    jsonb_build_object('id','f2','prompt','What is the core strategic bet?','options',jsonb_build_array('We can win on product quality','We can win on distribution or brand','We can win on price or cost','We can win on speed to market'))
  );

  strat_stages := jsonb_build_object(
    'options', jsonb_build_array(
      jsonb_build_object('id','o1','name','Go deep in current market','desc','Double down on the existing user base with more features and better retention.'),
      jsonb_build_object('id','o2','name','Expand to adjacent market','desc','Leverage existing AI capabilities to serve a related but new user segment.'),
      jsonb_build_object('id','o3','name','Build a new platform','desc','Invest in a platform play that opens up multiple future markets.'),
      jsonb_build_object('id','o4','name','Acquire or partner','desc','M&A or strategic partnership to enter the market faster than building.')
    )
  );

  strat_sample := 'Recommend expanding to the adjacent enterprise market. We have a right to win on product quality and existing AI capabilities. The enterprise segment has higher willingness to pay and lower churn. Biggest risk: longer sales cycles. Reversal trigger: if we cannot close 5 enterprise pilots within 6 months, pivot to a partnership-led go-to-market.';

  IF q_type = 'product_sense' THEN
    RETURN jsonb_build_object('framing', ps_framing, 'stages', ps_stages, 'sampleAnswer', ps_sample);
  ELSIF q_type = 'execution' THEN
    RETURN jsonb_build_object('framing', exec_framing, 'stages', exec_stages, 'sampleAnswer', exec_sample);
  ELSE
    RETURN jsonb_build_object('framing', strat_framing, 'stages', strat_stages, 'sampleAnswer', strat_sample);
  END IF;
END;
$func$ LANGUAGE plpgsql;

-- Insert 144 new AI PM questions (idempotent via WHERE NOT EXISTS)
INSERT INTO questions (text, type, source_company, difficulty, chip_options)
SELECT v.text, v.type, v.source_company, v.difficulty, gen_ai_chip_options(v.type)
FROM (VALUES
  -- Anthropic (18 new, 35 total)
  ('How would you design a feature for Claude that helps users write more effective prompts?', 'product_sense', 'Anthropic', 'medium'),
  ('Design a system to measure and improve Claude helpfulness across different user types.', 'product_sense', 'Anthropic', 'medium'),
  ('How would you build a feature that lets teams collaborate on Claude conversations?', 'product_sense', 'Anthropic', 'medium'),
  ('Design a feature for Claude that helps researchers summarize and analyze academic papers.', 'product_sense', 'Anthropic', 'medium'),
  ('How would you improve Claude ability to handle multi-step reasoning tasks?', 'product_sense', 'Anthropic', 'hard'),
  ('Design an onboarding experience that gets new Claude users to their first successful interaction.', 'product_sense', 'Anthropic', 'easy'),
  ('How would you build a feature that lets users compare Claude responses to other AI assistants?', 'product_sense', 'Anthropic', 'medium'),
  ('Design a feature for Claude that assists with code review and debugging.', 'product_sense', 'Anthropic', 'medium'),
  ('How would you design a feedback loop that helps Claude learn from user corrections?', 'product_sense', 'Anthropic', 'hard'),
  ('Design a feature that helps users understand when to trust versus verify Claude outputs.', 'product_sense', 'Anthropic', 'medium'),
  ('How would you handle Claude usage growing faster than infrastructure can support?', 'execution', 'Anthropic', 'hard'),
  ('How would you prioritize which new capabilities to add to Claude next quarter?', 'execution', 'Anthropic', 'medium'),
  ('How would you measure the ROI of Claude for enterprise customers?', 'execution', 'Anthropic', 'medium'),
  ('Design an experiment to test whether adding web search to Claude improves user retention.', 'execution', 'Anthropic', 'medium'),
  ('How would you reduce Claude average response latency by 30 percent without degrading quality?', 'execution', 'Anthropic', 'hard'),
  ('Design a strategy for Claude to expand into the enterprise market.', 'strategy', 'Anthropic', 'medium'),
  ('Design a strategy for Claude to compete with free AI assistants.', 'strategy', 'Anthropic', 'hard'),
  ('Should Anthropic open-source a smaller version of Claude? Why or why not?', 'strategy', 'Anthropic', 'hard'),

  -- OpenAI (14 new, 20 total)
  ('How would you design a feature for ChatGPT that improves user retention?', 'product_sense', 'OpenAI', 'medium'),
  ('Design a monetization strategy for GPT-4 API for small developers.', 'product_sense', 'OpenAI', 'medium'),
  ('How would you build a feature that lets users create and share custom GPTs?', 'product_sense', 'OpenAI', 'medium'),
  ('Design an onboarding experience for new ChatGPT users.', 'product_sense', 'OpenAI', 'easy'),
  ('How would you measure the impact of hallucinations on user trust in ChatGPT?', 'product_sense', 'OpenAI', 'medium'),
  ('Design a feature for ChatGPT that helps with data analysis and visualization.', 'product_sense', 'OpenAI', 'medium'),
  ('How would you build a recommendation system for GPT models based on user needs?', 'product_sense', 'OpenAI', 'hard'),
  ('Design a feature that helps users fact-check ChatGPT responses in real time.', 'product_sense', 'OpenAI', 'medium'),
  ('How would you handle a 10x spike in ChatGPT API usage over one weekend?', 'execution', 'OpenAI', 'hard'),
  ('How would you prioritize new features for ChatGPT enterprise offering?', 'execution', 'OpenAI', 'medium'),
  ('Design an experiment to test whether custom GPTs increase paid conversion rates.', 'execution', 'OpenAI', 'medium'),
  ('How would you reduce ChatGPT API costs for enterprise customers by 20 percent?', 'execution', 'OpenAI', 'hard'),
  ('Design a strategy for OpenAI to expand into the education market.', 'strategy', 'OpenAI', 'medium'),
  ('How should OpenAI compete with open-source AI models like Llama?', 'strategy', 'OpenAI', 'hard'),

  -- Google DeepMind (14 new)
  ('How would you design a feature for Gemini that improves multi-modal understanding?', 'product_sense', 'Google DeepMind', 'hard'),
  ('Design a product strategy for DeepMind AI in healthcare diagnostics.', 'product_sense', 'Google DeepMind', 'hard'),
  ('How would you build a feature that lets users interact with Gemini via voice?', 'product_sense', 'Google DeepMind', 'medium'),
  ('Design an onboarding experience for new Gemini users.', 'product_sense', 'Google DeepMind', 'easy'),
  ('How would you improve Gemini ability to reason about images and diagrams?', 'product_sense', 'Google DeepMind', 'hard'),
  ('Design a feature for Gemini that helps with scientific research and hypothesis generation.', 'product_sense', 'Google DeepMind', 'hard'),
  ('How would you build a feature that lets users customize Gemini response style?', 'product_sense', 'Google DeepMind', 'medium'),
  ('Design a feature for Gemini that assists with mathematical problem-solving.', 'product_sense', 'Google DeepMind', 'medium'),
  ('How would you handle the integration of DeepMind and Google Brain teams from a product perspective?', 'execution', 'Google DeepMind', 'hard'),
  ('How would you prioritize Gemini features across consumer and enterprise segments?', 'execution', 'Google DeepMind', 'medium'),
  ('Design an experiment to test whether Gemini multi-modal capabilities drive user engagement.', 'execution', 'Google DeepMind', 'medium'),
  ('How would you reduce Gemini inference costs while maintaining quality?', 'execution', 'Google DeepMind', 'hard'),
  ('Design a strategy for Google DeepMind to compete with OpenAI in the enterprise market.', 'strategy', 'Google DeepMind', 'medium'),
  ('Should Google DeepMind open-source Gemini smaller models?', 'strategy', 'Google DeepMind', 'hard'),

  -- Meta AI (12 new)
  ('How would you design a feature for Llama that improves developer adoption?', 'product_sense', 'Meta AI', 'medium'),
  ('Design a product strategy for Meta AI assistants in WhatsApp and Instagram.', 'product_sense', 'Meta AI', 'medium'),
  ('How would you build a feature that lets developers fine-tune Llama for their use cases?', 'product_sense', 'Meta AI', 'hard'),
  ('Design an onboarding experience for developers using Llama for the first time.', 'product_sense', 'Meta AI', 'easy'),
  ('How would you improve Llama performance on non-English languages?', 'product_sense', 'Meta AI', 'hard'),
  ('Design a feature for Meta AI that helps creators generate content.', 'product_sense', 'Meta AI', 'medium'),
  ('How would you build a recommendation system for Llama models based on task type?', 'product_sense', 'Meta AI', 'medium'),
  ('How would you handle a surge in Llama downloads overwhelming Meta infrastructure?', 'execution', 'Meta AI', 'hard'),
  ('How would you prioritize open-source contributions to Llama?', 'execution', 'Meta AI', 'medium'),
  ('Design an experiment to test whether AI assistants in WhatsApp increase user engagement.', 'execution', 'Meta AI', 'medium'),
  ('Design a strategy for Meta AI to monetize open-source AI models.', 'strategy', 'Meta AI', 'hard'),
  ('How should Meta AI compete with closed-source models like GPT-4?', 'strategy', 'Meta AI', 'medium'),

  -- Mistral AI (10 new)
  ('How would you design a feature for Mistral that improves developer adoption in Europe?', 'product_sense', 'Mistral AI', 'medium'),
  ('Design a product strategy for Mistral open-weight models in enterprise.', 'product_sense', 'Mistral AI', 'medium'),
  ('How would you build a feature that lets developers deploy Mistral models locally?', 'product_sense', 'Mistral AI', 'hard'),
  ('Design an onboarding experience for new Mistral API users.', 'product_sense', 'Mistral AI', 'easy'),
  ('How would you improve Mistral multilingual capabilities?', 'product_sense', 'Mistral AI', 'medium'),
  ('Design a feature for Mistral that helps with regulatory compliance in EU markets.', 'product_sense', 'Mistral AI', 'hard'),
  ('How would you prioritize Mistral model development roadmap with limited resources?', 'execution', 'Mistral AI', 'hard'),
  ('Design an experiment to test whether local deployment options increase enterprise conversion.', 'execution', 'Mistral AI', 'medium'),
  ('Design a strategy for Mistral to compete with larger AI labs.', 'strategy', 'Mistral AI', 'hard'),
  ('Should Mistral continue with open-weight releases or shift to closed-source?', 'strategy', 'Mistral AI', 'hard'),

  -- Hugging Face (10 new)
  ('How would you design a feature for Hugging Face that improves model discovery?', 'product_sense', 'Hugging Face', 'medium'),
  ('Design a product strategy for Hugging Face enterprise hub offering.', 'product_sense', 'Hugging Face', 'medium'),
  ('How would you build a feature that lets users compare model performance side by side?', 'product_sense', 'Hugging Face', 'medium'),
  ('Design an onboarding experience for new Hugging Face users.', 'product_sense', 'Hugging Face', 'easy'),
  ('How would you improve the model hosting and inference experience on Hugging Face?', 'product_sense', 'Hugging Face', 'medium'),
  ('Design a feature for Hugging Face that helps with dataset management.', 'product_sense', 'Hugging Face', 'medium'),
  ('How would you handle a surge in model downloads overwhelming Hugging Face infrastructure?', 'execution', 'Hugging Face', 'hard'),
  ('How would you prioritize new features for Hugging Face enterprise offering?', 'execution', 'Hugging Face', 'medium'),
  ('Design a strategy for Hugging Face to monetize its open-source community.', 'strategy', 'Hugging Face', 'hard'),
  ('How should Hugging Face compete with cloud provider model hubs?', 'strategy', 'Hugging Face', 'medium'),

  -- Cohere (10 new)
  ('How would you design a feature for Cohere that improves enterprise RAG adoption?', 'product_sense', 'Cohere', 'medium'),
  ('Design a product strategy for Cohere embed and rerank models.', 'product_sense', 'Cohere', 'medium'),
  ('How would you build a feature that lets enterprises fine-tune Cohere models?', 'product_sense', 'Cohere', 'hard'),
  ('Design an onboarding experience for new Cohere API users.', 'product_sense', 'Cohere', 'easy'),
  ('How would you improve Cohere multilingual embedding quality?', 'product_sense', 'Cohere', 'hard'),
  ('Design a feature for Cohere that helps with document understanding.', 'product_sense', 'Cohere', 'medium'),
  ('How would you prioritize Cohere model development with a smaller team?', 'execution', 'Cohere', 'hard'),
  ('Design an experiment to test whether fine-tuning options increase enterprise retention.', 'execution', 'Cohere', 'medium'),
  ('Design a strategy for Cohere to compete with OpenAI in enterprise RAG.', 'strategy', 'Cohere', 'medium'),
  ('Should Cohere focus on embeddings or generation models?', 'strategy', 'Cohere', 'hard'),

  -- Scale AI (10 new)
  ('How would you design a feature for Scale AI that improves data labeling efficiency?', 'product_sense', 'Scale AI', 'medium'),
  ('Design a product strategy for Scale AI RLHF annotation platform.', 'product_sense', 'Scale AI', 'medium'),
  ('How would you build a feature that lets customers manage their annotation workflows?', 'product_sense', 'Scale AI', 'medium'),
  ('Design an onboarding experience for new Scale AI customers.', 'product_sense', 'Scale AI', 'easy'),
  ('How would you improve the quality of AI-assisted annotations on Scale AI?', 'product_sense', 'Scale AI', 'hard'),
  ('Design a feature for Scale AI that helps with data curation for model training.', 'product_sense', 'Scale AI', 'medium'),
  ('How would you handle a surge in annotation demand from a major AI lab?', 'execution', 'Scale AI', 'hard'),
  ('How would you prioritize new annotation capabilities across modalities?', 'execution', 'Scale AI', 'medium'),
  ('Design a strategy for Scale AI to expand beyond data labeling.', 'strategy', 'Scale AI', 'medium'),
  ('How should Scale AI compete with automated labeling solutions?', 'strategy', 'Scale AI', 'hard'),

  -- xAI (10 new)
  ('How would you design a feature for Grok that improves real-time information access?', 'product_sense', 'xAI', 'medium'),
  ('Design a product strategy for xAI integration with social media platforms.', 'product_sense', 'xAI', 'medium'),
  ('How would you build a feature that lets users customize Grok personality?', 'product_sense', 'xAI', 'medium'),
  ('Design an onboarding experience for new Grok users.', 'product_sense', 'xAI', 'easy'),
  ('How would you improve Grok ability to handle controversial topics?', 'product_sense', 'xAI', 'hard'),
  ('Design a feature for Grok that assists with news summarization.', 'product_sense', 'xAI', 'medium'),
  ('How would you handle rapid scaling of Grok user base?', 'execution', 'xAI', 'hard'),
  ('How would you prioritize xAI model development with limited resources?', 'execution', 'xAI', 'hard'),
  ('Design a strategy for xAI to differentiate from other AI assistants.', 'strategy', 'xAI', 'medium'),
  ('Should xAI focus on consumer or enterprise markets first?', 'strategy', 'xAI', 'hard'),

  -- Perplexity (8 new)
  ('How would you design a feature for Perplexity that improves answer citation quality?', 'product_sense', 'Perplexity', 'medium'),
  ('Design a product strategy for Perplexity enterprise search offering.', 'product_sense', 'Perplexity', 'medium'),
  ('How would you build a feature that lets users save and organize their searches?', 'product_sense', 'Perplexity', 'easy'),
  ('Design an onboarding experience for new Perplexity users.', 'product_sense', 'Perplexity', 'easy'),
  ('How would you improve Perplexity ability to handle complex research queries?', 'product_sense', 'Perplexity', 'hard'),
  ('How would you handle a surge in Perplexity API usage?', 'execution', 'Perplexity', 'hard'),
  ('How would you prioritize new features for Perplexity Pro subscribers?', 'execution', 'Perplexity', 'medium'),
  ('Design a strategy for Perplexity to compete with Google Search.', 'strategy', 'Perplexity', 'hard'),

  -- Stability AI (8 new)
  ('How would you design a feature for Stable Diffusion that improves prompt adherence?', 'product_sense', 'Stability AI', 'medium'),
  ('Design a product strategy for Stability AI in the enterprise creative tools market.', 'product_sense', 'Stability AI', 'medium'),
  ('How would you build a feature that lets users control image generation with sketches?', 'product_sense', 'Stability AI', 'hard'),
  ('Design an onboarding experience for new Stable Diffusion users.', 'product_sense', 'Stability AI', 'easy'),
  ('How would you improve Stable Diffusion performance on text rendering in images?', 'product_sense', 'Stability AI', 'hard'),
  ('How would you handle a surge in Stable Diffusion API usage?', 'execution', 'Stability AI', 'hard'),
  ('How would you prioritize model improvements with limited compute resources?', 'execution', 'Stability AI', 'hard'),
  ('Design a strategy for Stability AI to monetize open-source image generation.', 'strategy', 'Stability AI', 'medium'),

  -- Inflection AI (5 new)
  ('How would you design a feature for Pi that improves emotional intelligence in conversations?', 'product_sense', 'Inflection AI', 'hard'),
  ('Design a product strategy for Inflection AI in the personal companion market.', 'product_sense', 'Inflection AI', 'medium'),
  ('How would you build a feature that lets users customize Pi conversational style?', 'product_sense', 'Inflection AI', 'medium'),
  ('How would you handle scaling Pi user base with limited infrastructure?', 'execution', 'Inflection AI', 'hard'),
  ('Design a strategy for Inflection AI to pivot toward enterprise use cases.', 'strategy', 'Inflection AI', 'hard'),

  -- Adept (5 new)
  ('How would you design a feature for Adept that improves action execution in browsers?', 'product_sense', 'Adept', 'hard'),
  ('Design a product strategy for Adept in the enterprise automation market.', 'product_sense', 'Adept', 'medium'),
  ('How would you build a feature that lets users create custom AI workflows?', 'product_sense', 'Adept', 'medium'),
  ('How would you prioritize Adept integrations with enterprise tools?', 'execution', 'Adept', 'medium'),
  ('Design a strategy for Adept to compete with RPA platforms.', 'strategy', 'Adept', 'hard'),

  -- Character.AI (5 new)
  ('How would you design a feature for Character.AI that improves character consistency?', 'product_sense', 'Character.AI', 'medium'),
  ('Design a product strategy for Character.AI in the entertainment and education markets.', 'product_sense', 'Character.AI', 'medium'),
  ('How would you build a feature that lets users collaborate on character creation?', 'product_sense', 'Character.AI', 'easy'),
  ('How would you handle Character.AI high compute costs per conversation?', 'execution', 'Character.AI', 'hard'),
  ('Design a strategy for Character.AI to monetize without alienating its free user base.', 'strategy', 'Character.AI', 'hard'),

  -- Runway (5 new)
  ('How would you design a feature for Runway that improves video generation quality?', 'product_sense', 'Runway', 'hard'),
  ('Design a product strategy for Runway in the professional video editing market.', 'product_sense', 'Runway', 'medium'),
  ('How would you build a feature that lets users control video generation with text and images?', 'product_sense', 'Runway', 'medium'),
  ('How would you handle Runway high compute costs for video generation?', 'execution', 'Runway', 'hard'),
  ('Design a strategy for Runway to compete with larger AI labs entering video generation.', 'strategy', 'Runway', 'medium')
) AS v(text, type, source_company, difficulty)
WHERE NOT EXISTS (
  SELECT 1 FROM questions q
  WHERE q.text = v.text AND q.source_company = v.source_company
);

-- Clean up helper function
DROP FUNCTION gen_ai_chip_options(text);
