// Compact authored exercise inputs. Each segment has two distinct pains;
// each solution is linked to the pain IDs it addresses by the builder.
export const productProfiles = {
  grocery: {
    scope:'AI weekly grocery planning',
    users:[
      ['Busy household planners','Meal-to-cart work is repetitive~Planning dinners requires manually translating recipes into a grocery list.','Missing ingredients disrupt meals~A plan fails because pantry assumptions or retailer inventory were wrong.'],
      ['Budget-conscious shoppers','Basket exceeds the budget~Suggested meals create an unaffordable weekly shop.','Substitutions are unsuitable~Replacement products ignore price, taste, or user-stated dietary constraints.'],
      ['Shared household cooks','Preferences conflict~Different household members need a reviewable agreement on meals.','Pantry state is uncertain~Nobody knows which ingredients are still available.'],
      ['Dietary-constrained shoppers','Constraints are misunderstood~The assistant treats a critical user requirement as an optional preference.','Purchases happen too early~Items are bought before the shopper checks the final basket.'],
    ],
    solutions:[
      ['Reviewable meal-to-cart','Translate approved meal choices into a basket with explicit quantities.',[1,3]],
      ['Confirmed pantry checklist','Ask users to verify uncertain stock before subtracting it from the list.',[2,6]],
      ['Budget and substitution controls','Show item-level alternatives within the agreed spending and preference constraints.',[3,4]],
      ['Shared household plan','Let household members approve meals and change stated requirements.',[5,7]],
      ['Final basket approval','Expose constraint checks and require confirmation before purchasing.',[7,8]],
    ],
    metrics:['Accepted workable baskets~Count grocery plans used without missing critical ingredients.','Planning effort~Measure time including pantry checks and basket corrections.','Retained weekly households~Track repeated use across weekly shops.','Guardrail: constraint violations~Audit unsuitable dietary suggestions and unapproved purchases.'],
  },
  animalCommunication: {
    scope:'hypothetical validated animal-signal interpretation',
    users:[
      ['Companion-animal caregivers','Behavior is hard to interpret~Owners cannot distinguish ordinary behavior from a meaningful change.','Generated speech misleads~A fluent sentence is mistaken for the animal’s verified intention.'],
      ['Animal behavior specialists','Evidence is not reproducible~An interpretation lacks the observable cues needed for expert review.','Capability scope is unclear~The model makes claims beyond the behaviors on which it was validated.'],
      ['Animal welfare caregivers','False reassurance delays help~A confident benign interpretation discourages appropriate professional attention.','History is fragmented~Important changes across recordings and caregiver notes are missed.'],
      ['Research pilot participants','Validation is insufficient~Participants cannot tell whether apparent communication exceeds chance.','Sensitive recordings uncontrolled~Household audio and video are stored or shared without clear permission.'],
    ],
    solutions:[
      ['Observable behavior diary','Organize user-selected recordings and notes without inventing first-person animal statements.',[1,6]],
      ['Evidence-linked interpretations','Show the observable signals supporting a narrow interpretation.',[2,3]],
      ['Validated capability boundaries','Restrict claims to independently tested behaviors and show uncertainty.',[4,7]],
      ['Qualified follow-up route','Explain when uncertainty or changes warrant expert attention.',[5,4]],
      ['Private supervised pilot','Limit recording and sharing and use blinded expert evaluation before commercialization.',[7,8]],
    ],
    metrics:['Validated interpretation quality~Measure performance against independently labeled observable behavior.','Caregiver comprehension~Check whether users understand the limits and uncertainty.','Useful observation follow-through~Track appropriate caregiver action based on verified signals.','Guardrail: false reassurance~Audit misleading certainty and delayed qualified help.'],
  },
  pickupCoordinator: {
    scope:'AI ride-share pickup coordination',
    users:[
      ['Large-venue riders','Pickup location ambiguous~A rider cannot identify the permitted meeting point at a complex venue.','Driver context is missing~The rider does not know which entrance or lane the driver is using.'],
      ['Ride-share drivers','Messages lack actionable detail~Drivers receive vague location descriptions while navigating.','Last-minute changes unsafe~A pickup suggestion requires an unsafe or prohibited maneuver.'],
      ['Accessibility-needing riders','Suggested route inaccessible~A meeting point cannot be reached using the rider’s stated access needs.','Important constraints lost~The coordinator forgets a confirmed mobility or assistance requirement.'],
      ['Venue operations teams','Local rules change~Construction or event routing makes stored guidance outdated.','Pickup failures unobserved~The platform cannot distinguish confusing instructions from a driver delay.'],
    ],
    solutions:[
      ['Approved pickup-point cards','Propose a clearly described permitted meeting point with venue landmarks.',[1,4]],
      ['Confirmed shared pickup plan','Show the same approved location and concise context to rider and driver.',[2,3]],
      ['Accessible route constraints','Apply user-confirmed access requirements before suggesting a point.',[5,6]],
      ['Venue guidance updates','Maintain local pickup rules and suppress stale recommendations.',[4,7]],
      ['Human contact and recovery','Keep direct rider-driver contact and record why a pickup plan failed.',[3,8]],
    ],
    metrics:['Successful first pickup attempts~Count rider-driver meetings without location repair.','Arrival-to-pickup time~Measure delay after the driver reaches the venue.','Cancellation reduction~Estimate incremental avoided pickup-related cancellations.','Guardrail: unsafe guidance~Audit prohibited, inaccessible, or unsafe meeting instructions.'],
  },
  netflixPlacement: {
    scope:'creator-approved generative product placement in streaming',
    users:[
      ['Brand advertisers','Placement value unproven~A rendered product appearance does not establish incremental advertising impact.','Creative claims inaccurate~Generated placement misrepresents the offer or product.'],
      ['Film and show creators','Story integrity is altered~An inserted product changes the intended meaning or visual composition.','Approval authority unclear~The team cannot identify who can authorize changes to existing content.'],
      ['Streaming viewers','Sponsorship is deceptive~A viewer cannot tell that a scene has been commercially altered.','Rendering breaks immersion~Objects, lighting, or continuity look unnatural.'],
      ['Platform commercial operators','Rights are incomplete~A product or likeness appears without sufficient authorization.','Rendering economics uncertain~Version creation and review cost more than the incremental ad value.'],
    ],
    solutions:[
      ['Approved scene catalog','Limit the MVP to licensed scenes and creator-authorized placement boundaries.',[3,4,7]],
      ['Advertiser creative preview','Require review of product appearance and commercial claims before serving.',[2,7]],
      ['Editorial quality review','Check scene meaning, continuity, and visual realism with creative reviewers.',[3,6]],
      ['Clear placement disclosure','Explain commercial alteration without implying an original creator endorsement.',[5,4]],
      ['Holdout-based campaign pilot','Measure advertiser lift and viewer effects against rendering and review costs.',[1,8]],
    ],
    metrics:['Incremental advertiser lift~Estimate the causal effect of eligible product placement exposure.','Creator-approved placements~Count integrations approved under explicit creative and rights constraints.','Contribution per placement~Include generation, review, serving, and licensing costs.','Guardrail: viewer trust loss~Track misleading sponsorship, quality complaints, and viewing satisfaction.'],
  },
  inboxAssistant: {
    scope:'Gmail AI inbox management',
    users:[
      ['High-volume professionals','Important requests buried~Users cannot identify actionable mail among recurring low-priority messages.','Deadline details missed~A long thread hides a required response or commitment.'],
      ['Customer-facing coordinators','Thread context takes time~Users repeatedly reread conversations before drafting a reply.','Drafts invent commitments~The assistant promises something not supported by the actual thread.'],
      ['Email-overwhelmed newcomers','Triage rules are hard~Users cannot configure a reliable filter and priority system.','Bulk actions feel risky~The user fears archiving or deleting mail they still need.'],
      ['Privacy-sensitive users','Digest reveals sensitive text~A summary exposes confidential information in the wrong context.','Assistant sends without approval~An external reply is transmitted before meaningful review.'],
    ],
    solutions:[
      ['Source-linked priority digest','Summarize important requests with exact thread links and visible uncertainty.',[1,2]],
      ['Reviewable reply drafts','Draft bounded responses using thread evidence without sending automatically.',[3,4,8]],
      ['Suggested triage rules','Offer understandable rules with a preview of affected messages.',[5,6]],
      ['Reversible batch organization','Let users approve and undo low-risk inbox organization actions.',[5,6]],
      ['Private action previews','Protect sensitive digest content and require approval for external communication.',[7,8]],
    ],
    metrics:['Inbox job completion time~Include reviewing priorities, replying, and checking uncertain messages.','Important requests acted on~Count commitments handled correctly before their due time.','Retained triage workflows~Measure repeated voluntary digest and organization use.','Guardrail: missed important mail~Audit hidden commitments, incorrect drafts, and unapproved sends.'],
  },
  renovation: {
    scope:'AI home renovation scope planning',
    users:[
      ['First-time renovating owners','Needs are poorly specified~A homeowner cannot translate an idea into a contractor-ready project brief.','Quotes are incomparable~Different contractors assume different scope and materials.'],
      ['Budget-constrained owners','Costs lack assumptions~A rough estimate is mistaken for a guaranteed project price.','Changes emerge too late~Hidden requirements cause repeated revisions after quoting.'],
      ['Small contractor teams','Intake is incomplete~Photos and messages omit the details required to quote responsibly.','AI scope sounds authoritative~A generated brief implies technical certainty without inspection.'],
      ['Multi-person households','Preferences conflict~Stakeholders disagree about priorities and acceptable tradeoffs.','Planning decisions disappear~The team cannot trace which changes were agreed and why.'],
    ],
    solutions:[
      ['Guided project brief','Collect homeowner goals, photos, constraints, and explicit unknowns.',[1,5]],
      ['Comparable quote checklist','Standardize the review of contractor inclusions, exclusions, and assumptions.',[2,3]],
      ['Unknown-condition flags','Identify questions needing a qualified site inspection rather than inventing certainty.',[4,6]],
      ['Shared priority review','Let household members agree must-haves and budget tradeoffs before quoting.',[7,1]],
      ['Versioned scope history','Record approved changes so homeowners and contractors compare the same brief.',[8,4]],
    ],
    metrics:['Contractor-usable briefs~Count briefs contractors accept as sufficient for the next planning step.','Time to comparable quotes~Measure effort to receive and compare equivalent proposals.','Paid planning conversion~Track owners paying after completing a real scoping job.','Guardrail: unsupported technical claims~Audit misleading structural, safety, or guaranteed-price assertions.'],
  },
  airbnbPets: {
    scope:'Airbnb stays for owners traveling with pets',
    users:[
      ['Dog-owning travelers','Pet rules are ambiguous~A pets-allowed label does not specify size, number, or behavior restrictions.','Unexpected pet fees~Charges appear too late to compare suitable stays.'],
      ['Multi-pet households','Suitability varies by animal~A listing accepts one species or size but not the actual traveling animals.','Amenities are unverified~Owners cannot tell whether fences or nearby walking areas fit their needs.'],
      ['Pet-friendly hosts','Guest expectations differ~Owners arrive with animals outside the host’s confirmed rules.','Incidents create host burden~Damage or complaints make hosts reluctant to accept future pet stays.'],
      ['Cautious first-time travelers','Confirmation requires messages~Users must contact many hosts before knowing whether a booking is viable.','Recovery options unclear~A last-minute pet-rule mismatch leaves no usable alternative.'],
    ],
    solutions:[
      ['Structured pet suitability','Show host-confirmed species, size, count, and stay restrictions.',[1,3]],
      ['Transparent total pet fees','Include pet-related costs in a comparable total before booking.',[2,7]],
      ['Verified amenity details','Collect specific evidence about relevant property and area features.',[4,1]],
      ['Pre-book host confirmation','Confirm unusual animal requirements before a consequential booking decision.',[5,7]],
      ['Pet-stay recovery support','Provide a clear route for rule mismatches and incident handling.',[6,8]],
    ],
    metrics:['Successful pet stays~Count completed stays without pet-rule or suitability failure.','Pet booking conversion~Measure suitable searches reaching a confirmed booking.','Retained pet-friendly hosts~Track hosts continuing to offer viable pet stays.','Guardrail: pet-related incidents~Count unsafe suitability, unexpected restrictions, and host complaints.'],
  },
  enterpriseSafety: {
    scope: 'enterprise Claude agent deployment',
    users: [
      ['Workflow developers', 'Cannot constrain tool access~A prototype can call more enterprise tools than its business task requires.', 'Unreliable action retries~Retrying a partially completed workflow can repeat a business-record change.'],
      ['Security reviewers', 'No evidence for approval~Reviewers cannot inspect which sources and actions an agent can use.', 'Injection bypasses policy~Untrusted retrieved documents can redirect the agent toward unauthorized actions.'],
      ['Operations owners', 'Unclear approval burden~Routine agent steps require so much review that delegation saves little time.', 'Cannot recover changes~The team cannot reliably identify and undo a mistaken agent action.'],
      ['Enterprise administrators', 'Permissions drift over time~Agent access persists after employee roles or source permissions change.', 'Missing incident visibility~Administrators cannot reconstruct which tool action caused a customer incident.'],
    ],
    solutions: [
      ['Scoped tool gateway', 'Enforce per-workflow allowlists and validated action schemas outside the Claude model.', [1,7]],
      ['Replay approval sandbox', 'Let security reviewers run realistic tasks and adversarial documents before production approval.', [3,4]],
      ['Risk-based action review', 'Request approval for consequential writes while allowing bounded reversible steps to proceed.', [5,1]],
      ['Transactional recovery log', 'Record action IDs and recovery steps so retries and partial failures do not duplicate changes.', [2,6]],
      ['Permission audit console', 'Surface source access changes and trace each business action to its initiating workflow.', [7,8]],
    ],
    metrics: ['Verified policy-safe workflows~Count completed business workflows that pass outcome and authorization audits.', 'Deployment approval time~Measure elapsed time from a ready prototype to security-approved production use.', 'Human review minutes~Measure operator time per correctly completed delegated workflow.', 'Guardrail: unauthorized actions~Count attempted and completed actions outside granted enterprise permissions.'],
  },
  enterpriseReports: {
    scope: 'recurring enterprise knowledge-work reports',
    users: [
      ['Customer success managers', 'Repeated account preparation~Account reviews require rebuilding the same context from many documents.', 'Unsupported client claims~A plausible draft can include claims that no approved source supports.'],
      ['Operations analysts', 'Sources change between runs~A recurring report silently reuses outdated numbers or assumptions.', 'Manual export cleanup~Analysts spend time reformatting an otherwise useful report for stakeholders.'],
      ['Team reviewers', 'Cannot isolate changes~Reviewers must reread the entire report to find new claims and edits.', 'Unclear task ownership~A multistep report stalls when nobody knows which section needs approval.'],
      ['Workspace administrators', 'Cross-team source exposure~Shared playbooks can reveal information beyond a teammate’s source permissions.', 'No reusable governance~Every report template requires a separate manual approval process.'],
    ],
    solutions: [
      ['Reusable report playbooks', 'Save a scoped task brief and report outline that can be rerun against selected sources.', [1,8]],
      ['Claim-linked evidence', 'Attach approved source passages to consequential statements in each report section.', [2,3]],
      ['Visible task checkpoints', 'Show progress and responsible reviewers before the assistant continues larger tasks.', [6,1]],
      ['Reviewable report diffs', 'Highlight changed sources and claims and export an approved artifact without reformatting.', [3,4,5]],
      ['Permission-aware sharing', 'Evaluate every viewer’s source access before exposing shared report content.', [7,8]],
    ],
    metrics: ['Accepted reports per team~Count reports approved for actual stakeholder use each week.', 'End-to-end preparation time~Include gathering sources, drafting, reviewing, correcting, and exporting.', 'Retained report workflows~Measure teams repeating an approved playbook across successive reporting periods.', 'Guardrail: unsupported claims~Audit consequential report statements for evidence and source permission compliance.'],
  },
  gleanHome: {
    scope: 'Glean homepage work discovery',
    users: [
      ['New engineering hires', 'Cannot find onboarding context~New hires do not know which internal documents answer their first tasks.', 'No reliable document owner~A search result does not show who maintains the onboarding material.'],
      ['Returning project contributors', 'Lost work context~Employees cannot quickly resume the documents and questions used yesterday.', 'Missed project updates~Important changes are buried among irrelevant homepage recommendations.'],
      ['Cross-functional leads', 'Information split across tools~Planning requires collecting updates from several systems with inconsistent metadata.', 'Unclear update freshness~Leads cannot tell whether a surfaced project summary reflects current information.'],
      ['Knowledge administrators', 'Restricted metadata leaks~Recommendations can expose titles or context from sources an employee cannot access.', 'Stale content persists~Dismissed or obsolete recommendations continue appearing on the homepage.'],
    ],
    solutions: [
      ['Role-based onboarding cards', 'Show source-owned starting points tied to the new employee’s immediate engineering tasks.', [1,2]],
      ['Continue work shelf', 'Restore the documents and unresolved questions a returning employee was actively using.', [3,4]],
      ['Source-backed update digest', 'Group relevant cross-tool changes with timestamps and links to original material.', [4,5,6]],
      ['Document ownership cues', 'Display maintainers, freshness, and a route to flag outdated knowledge.', [2,6,8]],
      ['Permissioned recommendation controls', 'Enforce source access before ranking and let users dismiss irrelevant homepage cards.', [7,8]],
    ],
    metrics: ['Successful homepage work starts~Count homepage visits leading to a user-verified useful work resource.', 'Time to useful document~Measure time from homepage arrival to finding the required reliable material.', 'Relevant card reuse~Track returning employees reusing task-relevant homepage resources.', 'Guardrail: restricted exposure~Audit unauthorized titles, snippets, and linked document access.'],
  },
  supportAgent: {
    scope: 'authenticated customer-support agent workflows',
    users: [
      ['Playback support customers', 'Repeated troubleshooting questions~Customers must explain device and playback symptoms again after every handoff.', 'Cannot reach human help~An automated conversation loops instead of escalating an unresolved issue.'],
      ['Account support customers', 'Risky account changes~The agent may change subscription or identity details without meaningful confirmation.', 'Policy answers lack context~Generic guidance ignores the customer’s actual account eligibility.'],
      ['Human support specialists', 'Incomplete escalation notes~Agents receive a transcript without the diagnostic steps already attempted.', 'No evidence for advice~Specialists cannot see which policy source supported an automated response.'],
      ['Integration engineers', 'Duplicate write operations~A retried tool call can repeat a refund or account update.', 'Stale account permissions~The support workflow continues using access that the account no longer grants.'],
    ],
    solutions: [
      ['Account-aware diagnosis', 'Use authorized account and device context to choose approved troubleshooting steps.', [1,4]],
      ['Explicit action confirmation', 'Preview consequential account changes and enforce deterministic policy before execution.', [3,7]],
      ['Persistent human handoff', 'Offer a human route with issue context, attempted steps, and a clear escalation reason.', [2,5]],
      ['Policy evidence panel', 'Attach source and policy-version evidence to support recommendations and case summaries.', [4,6]],
      ['Idempotent tool boundary', 'Validate scoped tool calls and track action identifiers across retries and permission changes.', [7,8]],
    ],
    metrics: ['Verified issue resolutions~Count cases resolved correctly without repeat contact during the agreed observation window.', 'Resolution time~Measure customer effort and elapsed time through any human escalation.', 'Successful escalation rate~Measure unresolved cases reaching a human with usable diagnostic context.', 'Guardrail: incorrect account changes~Audit unauthorized, duplicate, or policy-ineligible account actions.'],
  },
  geminiProactive: {
    scope: 'opt-in proactive Gemini meeting preparation',
    users: [
      ['Client meeting owners', 'Preparation starts too late~Users notice a meeting before they have gathered relevant customer context.', 'Brief lacks evidence~A fluent briefing contains claims without links to the underlying documents.'],
      ['Cross-team collaborators', 'Unclear preparation relevance~Generic reminders do not identify what this participant needs for the meeting.', 'Repeated noisy suggestions~Too many proactive prompts interrupt work without providing new value.'],
      ['Privacy-conscious professionals', 'Unclear context access~Users do not know which calendar and document details Gemini inspected.', 'Sensitive context appears~A proactive card reveals meeting material in an inappropriate setting.'],
      ['Busy meeting participants', 'Wrong delivery moment~A useful briefing arrives during a focus block or after the meeting.', 'Cannot control suggestion scope~Users cannot limit reminder cadence, sources, or categories.'],
    ],
    solutions: [
      ['Scheduled preparation cards', 'Offer a source-backed briefing at a user-selected interval before eligible meetings.', [1,7]],
      ['Role-specific briefing', 'Select relevant decisions and open questions for the participant’s meeting role.', [2,3]],
      ['Quiet-hours feedback loop', 'Let users dismiss suggestions and set frequency and timing preferences.', [4,7,8]],
      ['Visible source permissions', 'Show selected context and let users revoke calendar or document sources.', [5,6]],
      ['Private briefing preview', 'Keep sensitive details hidden until the user deliberately opens the preparation card.', [6,8]],
    ],
    metrics: ['Useful briefings used~Count meetings where participants confirm using the briefing for preparation.', 'Preparation time saved~Compare total preparation effort against the normal meeting workflow.', 'Repeat opt-in use~Measure voluntary retained use of the same proactive preparation job.', 'Guardrail: unwanted interruptions~Track irrelevant suggestions, opt-outs, and sensitive-context exposure.'],
  },
  scheduling: {
    scope: 'cross-organization AI meeting scheduling',
    users: [
      ['External sales coordinators', 'Too many coordination rounds~Scheduling across companies requires repeated messages about availability.', 'Ambiguous recipient identity~The assistant may propose or send an invite to the wrong contact.'],
      ['Executive assistants', 'Constraints change mid-flow~A selected time becomes invalid when priorities or calendars change.', 'Cannot preserve preferences~Recurring scheduling rules must be restated for every meeting.'],
      ['Interview scheduling teams', 'Multi-person conflicts~Interview loops need several calendars and room constraints to align.', 'Partial booking failures~Some attendees receive bookings while another required booking fails.'],
      ['Privacy-conscious attendees', 'Private event details leak~The assistant reveals event content when only availability is needed.', 'Unapproved calendar changes~An assistant cancels or moves an event without meaningful consent.'],
    ],
    solutions: [
      ['Constraint-led slot proposals', 'Collect scheduling requirements and propose feasible slots before any invitation.', [1,3,5]],
      ['Recipient confirmation preview', 'Show contact identity, attendees, and timing before sending externally.', [2,8]],
      ['Reusable scheduling rules', 'Save explicit work hours and meeting preferences with an easy override.', [4,1]],
      ['Atomic booking recovery', 'Detect partial failures and reconcile invitations without duplicate events.', [5,6]],
      ['Free-busy permission boundary', 'Use minimal availability data and require approval for consequential calendar changes.', [7,8]],
    ],
    metrics: ['Correctly scheduled meetings~Count meetings booked without conflicts or human repair.', 'Coordination effort~Measure messages and labor minutes needed per successfully scheduled meeting.', 'Scheduling completion rate~Track eligible scheduling requests reaching a confirmed booking.', 'Guardrail: unauthorized changes~Count wrong-recipient invitations, private-detail leaks, and unapproved cancellations.'],
  },
  abuseSafety: {
    scope: 'consumer generative-AI abuse prevention',
    users: [
      ['Everyday assistant users', 'Legitimate requests blocked~Benign creative or educational requests trigger an unnecessary refusal.', 'Unsafe answers appear~Users receive harmful content while pursuing an otherwise ordinary task.'],
      ['Moderation professionals', 'Context mistaken for intent~Quoted abuse and counterspeech are classified as abusive participation.', 'No useful safe alternative~A refusal does not help complete the legitimate underlying moderation job.'],
      ['Multilingual communities', 'Unequal language protection~Safety behavior is weaker or more restrictive in some languages.', 'Cultural context missed~Meaning changes across dialects and local usage that filters do not recognize.'],
      ['Trust and safety teams', 'Novel attacks evade rules~Adversaries reformulate jailbreaks faster than static blocklists update.', 'No actionable incident trace~The team cannot reconstruct the prompt and tool path behind a severe failure.'],
    ],
    solutions: [
      ['Contextual intent checks', 'Evaluate the intended task and surrounding context instead of blocking isolated keywords.', [1,3,6]],
      ['Safe task redirection', 'Offer allowed ways to achieve benign goals when part of a request is unsafe.', [2,4]],
      ['Paired language evaluations', 'Test matched benign and harmful requests across supported languages and dialects.', [5,6]],
      ['Adversarial replay pipeline', 'Replay observed and held-out jailbreak patterns before shipping new safeguards.', [7,2]],
      ['Incident response controls', 'Record privacy-conscious traces and provide rapid containment for severe abuse classes.', [7,8]],
    ],
    metrics: ['Useful safe completions~Count legitimate tasks completed without violating the stated safety policy.', 'Attack success by severity~Audit harmful compliance across known and held-out jailbreak categories.', 'Unnecessary refusal rate~Measure refusals on independently labeled benign tasks.', 'Guardrail: severe harm exposure~Track severe harmful outputs reaching users by cohort and language.'],
  },
  travelAgents: {
    scope: 'professional travel-agent booking portal',
    users: [
      ['Independent leisure agents', 'Quotes take repeated entry~Agents rebuild the same client itinerary across several supplier tools.', 'Commission status unclear~Agents cannot reliably reconcile what commission an itinerary will earn.'],
      ['Corporate travel coordinators', 'Approval rules fragmented~Company budgets and policy approvals sit outside the booking workflow.', 'Group changes cascade~One itinerary change requires manually checking many travelers and bookings.'],
      ['Specialist tour planners', 'Complex trips hard to compare~Multi-stop quotes conceal differences in transfers and supplier conditions.', 'Availability changes while quoting~A promising itinerary cannot be booked at the quoted price.'],
      ['Agency managers', 'Team work is invisible~Managers cannot see quote ownership, progress, and client response.', 'Channel margins uncertain~Support and incentive costs can exceed the incremental booking margin.'],
    ],
    solutions: [
      ['Reusable itinerary quoting', 'Build an editable trip brief that can generate comparable supplier-backed quotes.', [1,5]],
      ['Commission reconciliation view', 'Show contract-backed commission and the status of eligible bookings.', [2,8]],
      ['Policy approval workflow', 'Apply company travel rules and collect named approval before booking.', [3,4]],
      ['Live quote validation', 'Recheck inventory, price, transfers, and cancellation conditions before client approval.', [5,6]],
      ['Agency collaboration board', 'Track quote ownership and activity alongside account-level service economics.', [7,8]],
    ],
    metrics: ['Incremental booked margin~Measure booking contribution after service, incentive, and channel costs.', 'Quote-to-book conversion~Track agent quotes that become confirmed bookings.', 'Retained active agencies~Count agencies repeatedly completing bookings through the portal.', 'Guardrail: quote discrepancies~Count unbookable quotes, unexpected fees, and misrepresented conditions.'],
  },
  hallucinationEvidence: {
    scope: 'source-grounded factual AI assistance',
    users: [
      ['Professional researchers', 'Fabricated source references~An answer cites material that does not exist or does not support its claim.', 'Conflicting evidence hidden~The answer presents certainty where available sources disagree.'],
      ['Knowledge workers', 'Stale information reused~A response repeats an old fact despite newer approved source material.', 'Verification takes too long~Users must manually check every claim before using the answer.'],
      ['Consequential task reviewers', 'Wrong claims sound certain~Persuasive wording makes unsupported consequential statements hard to detect.', 'Abstention blocks valid work~The assistant refuses a task that available evidence could safely answer.'],
      ['AI quality analysts', 'Failure labels inconsistent~Reviewers disagree about false, unsupported, and fictional content.', 'Judge shares blind spots~An automated evaluator repeats the answer model’s mistaken assumptions.'],
    ],
    solutions: [
      ['Claim-linked source retrieval', 'Retrieve approved evidence and attach exact supporting passages to factual claims.', [1,4]],
      ['Contradiction and freshness checks', 'Surface conflicting sources and their publication or update context.', [2,3]],
      ['Risk-tiered verification', 'Route consequential claims through independent evidence checks and human review.', [4,5]],
      ['Evidence-aware abstention', 'Explain missing evidence while completing supported parts of a request.', [5,6]],
      ['Human-calibrated claim rubric', 'Define claim-level labels and audit automated judges against independent raters.', [7,8]],
    ],
    metrics: ['Verified useful answers~Count answers that complete the user’s task and pass independent factual review.', 'Unsupported claim rate~Audit factual claims against their cited evidence.', 'Useful answer coverage~Measure legitimate tasks completed rather than unnecessarily refused.', 'Guardrail: severe factual errors~Count consequential false or unsupported claims delivered to users.'],
  },
  claudeWorkflows: {
    scope: 'Claude workflows using the current model',
    users: [
      ['Recurring report authors', 'Rebuild context every week~Repeated reports require new chats with the same sources and instructions.', 'Cannot see source changes~Authors cannot distinguish new facts from a previous report’s stale assumptions.'],
      ['Document collaborators', 'Draft revisions lose intent~Editing one part of an artifact unexpectedly changes other requirements.', 'Handoffs lack task state~A teammate sees a transcript without the current deliverable and open decisions.'],
      ['Research professionals', 'Long projects lose evidence~Important facts disappear as a long-running chat evolves.', 'Corrections do not persist~A verified user correction is forgotten during later task steps.'],
      ['Workspace owners', 'Sharing exceeds permissions~Reusable context includes sources some teammates cannot access.', 'Playbooks lack versioning~A team cannot identify which instruction change caused a report regression.'],
    ],
    solutions: [
      ['Reusable project playbooks', 'Save scoped sources and a task brief for recurring Claude jobs.', [1,8]],
      ['Artifact-focused revisions', 'Edit a selected artifact region while preserving explicit constraints elsewhere.', [3,4]],
      ['Visible context ledger', 'Show active evidence and durable corrections with links to original sources.', [5,6]],
      ['Source and output diffs', 'Highlight changed inputs and claims between recurring deliverables.', [2,3]],
      ['Governed team versions', 'Version instructions and apply viewer permissions when sharing project context.', [7,8]],
    ],
    metrics: ['Accepted recurring deliverables~Count outputs used in real work across successive runs.', 'Total correction effort~Measure review and repair time in addition to initial generation.', 'Retained team workflows~Track teams repeatedly using the same playbook for valuable work.', 'Guardrail: stale-context errors~Audit incorrect outputs caused by outdated facts or lost constraints.'],
  },
  sonnetModel: {
    scope: 'Claude Sonnet foundational-model capability',
    users: [
      ['Repository coding teams', 'Tool use fails mid-task~The model chooses invalid tools or loses the goal during a multi-step change.', 'Tests miss intent~Generated code passes visible tests while failing the actual requested behavior.'],
      ['Enterprise reasoning developers', 'Instructions conflict silently~The model ignores a critical task constraint when evidence is long or ambiguous.', 'Failures hard to reproduce~Small context variations produce inconsistent answers on the same workflow.'],
      ['Latency-sensitive builders', 'Reasoning adds excessive delay~Customers wait too long for simple production requests.', 'Cost grows without value~More inference compute does not improve the customer’s accepted task outcomes.'],
      ['Safety evaluation researchers', 'New capability regresses safety~A stronger checkpoint introduces harmful compliance or permission failures.', 'Benchmarks miss workflows~Broad scores conceal regressions on actual enterprise tasks.'],
    ],
    solutions: [
      ['Repository-task evaluation set', 'Use held-out changes, hidden tests, and maintainer review to guide model priorities.', [1,2,8]],
      ['Instruction adherence program', 'Target research and training work at failures on explicit enterprise constraints.', [3,4]],
      ['Adaptive reasoning budget', 'Evaluate inference depth by task difficulty instead of applying maximum compute everywhere.', [5,6]],
      ['Regression-gated model releases', 'Require workflow and safety comparisons against the current Sonnet checkpoint.', [7,8]],
      ['Failure-driven research loop', 'Cluster customer failures and validate research hypotheses on untouched tasks.', [1,4]],
    ],
    metrics: ['Held-out task success~Measure independently verified customer-task completion by checkpoint.', 'Constraint adherence~Audit whether the model follows all material task instructions.', 'Cost per accepted outcome~Include inference costs for retries and verification.', 'Guardrail: safety regressions~Compare severe failure and refusal rates against the deployed checkpoint.'],
  },
  claudeCode: {
    scope: 'reviewable Claude Code repository changes',
    users: [
      ['Individual maintainers', 'Edits exceed intended scope~A small change spreads into unrelated files and requirements.', 'No clear test evidence~Developers cannot see which checks support the proposed patch.'],
      ['Enterprise team champions', 'Teammates repeat setup~A successful workflow cannot easily be shared with colleagues safely.', 'Repository context inconsistent~Each developer supplies different instructions and conventions.'],
      ['Code reviewers', 'Diff intent is unclear~Reviewers cannot connect changed lines to the original task plan.', 'Generated defects escape~Plausible code misses hidden edge cases or creates security regressions.'],
      ['Engineering administrators', 'Command authority too broad~Coding agents run shell or repository actions outside approved scope.', 'Failed sessions lose progress~Engineers cannot recover a useful task after an interrupted tool call.'],
    ],
    solutions: [
      ['Plan-and-diff review', 'Show an agreed task plan and explain each scoped repository change.', [1,5]],
      ['Targeted test evidence', 'Run relevant checks and expose results alongside the patch.', [2,6]],
      ['Approved team recipes', 'Share runnable repository workflows with team-approved instructions and permissions.', [3,4]],
      ['Scoped command previews', 'Require meaningful approval when a command or file change exceeds the agreed plan.', [1,7]],
      ['Resumable task checkpoints', 'Persist work state and recover safely after failed or interrupted operations.', [8,2]],
    ],
    metrics: ['Reviewed changes accepted~Count task changes merged after maintainer review and relevant checks.', 'Review-inclusive completion time~Measure coding time plus human review and rework.', 'Retained active teams~Track teams repeatedly completing useful Claude Code tasks.', 'Guardrail: escaped defects~Measure post-merge faults and unauthorized command execution.'],
  },
  recruiterOutreach: {
    scope: 'recruiter outreach improving qualified candidate replies',
    users: [
      ['In-house role recruiters', 'Messages lack credible fit~Candidates receive outreach that does not explain why their experience matches the role.', 'Too much manual research~Recruiters repeatedly gather the same role and candidate context.'],
      ['Specialist agency recruiters', 'Personalization becomes intrusive~Outreach uses irrelevant personal details or implies a relationship that does not exist.', 'Follow-ups create fatigue~Automation repeatedly contacts candidates who are not interested.'],
      ['Passive job candidates', 'Role value is unclear~A message does not state the opportunity, expectations, or reason to respond.', 'Preferences are ignored~Recruiting messages disregard location, level, or contact preferences.'],
      ['Recruiting operations leads', 'Replies are not qualified~A response-rate lift does not translate into suitable interviews.', 'Experiment attribution is weak~Candidates receive messages from multiple recruiters or test variants.'],
    ],
    solutions: [
      ['Evidence-based fit brief', 'Map approved role requirements to relevant professional candidate evidence.', [1,2]],
      ['Reviewable outreach drafts', 'Draft concise messages with factual claims and editable role value propositions.', [3,5]],
      ['Consent-aware contact limits', 'Honor opt-outs and limit repeated outreach across recruiters.', [4,6]],
      ['Qualified response tracking', 'Connect positive replies to fit screening and actual interview progression.', [7,5]],
      ['Candidate-level experiments', 'Assign candidates to one outreach variant and control sender and role differences.', [8,7]],
    ],
    metrics: ['Qualified positive reply rate~Measure suitable positive replies per delivered message.', 'Interview progression~Track outreach recipients reaching a relevant screening or interview.', 'Recruiter preparation time~Measure research and drafting effort per qualified response.', 'Guardrail: spam complaints~Track opt-outs, unwanted follow-ups, and intrusive personalization reports.'],
  },
  aiDiscovery: {
    scope: 'zero-to-one AI workflow discovery',
    users: [
      ['Domain professionals', 'Demo misses the real job~A polished prototype does not fit the constraints of daily work.', 'Correction erases time savings~Review and repair take longer than the original manual task.'],
      ['Product designers', 'Only happy paths tested~Research excludes ambiguous requests, failed outputs, and recovery.', 'Trust boundary is unclear~The prototype does not explain what the assistant is allowed to do.'],
      ['Application engineers', 'Evaluation target changes~The team builds before agreeing how to judge successful task completion.', 'Prototype requires unavailable data~The concept depends on data the target customer cannot provide.'],
      ['Business sponsors', 'Interest is not demand~Positive demo feedback does not turn into repeated use or payment.', 'Serving cost is unknown~The team cannot estimate margin at realistic usage and verification volume.'],
    ],
    solutions: [
      ['Observed-workflow research', 'Watch real tasks and document current effort, constraints, and workarounds.', [1,4]],
      ['Failure-inclusive prototypes', 'Prototype bad outputs, uncertainty, and repair alongside the intended flow.', [2,3]],
      ['Shared outcome rubric', 'Agree task-quality labels and launch evidence with design, engineering, and domain experts.', [5,1]],
      ['Concierge demand pilot', 'Deliver the job manually with AI assistance to test repeat value before building full autonomy.', [6,7]],
      ['Quality-cost feasibility model', 'Estimate viable unit economics using real task volume and correction effort.', [8,2]],
    ],
    metrics: ['Repeat verified task completion~Count users voluntarily repeating a successfully completed job.', 'End-to-end effort reduction~Include setup, supervision, review, and downstream repair.', 'Paid pilot conversion~Measure customers committing budget after experiencing the actual workflow.', 'Guardrail: consequential failures~Audit severe mistakes and misunderstandings about assistant authority.'],
  },
  datadog: {
    scope: 'Datadog AI incident investigation',
    users: [
      ['On-call responders', 'Telemetry context is scattered~Responders switch among logs, traces, metrics, and deploy history during an incident.', 'False leads waste time~AI hypotheses sound plausible but do not explain the observed outage.'],
      ['Service owners', 'Service dependencies unclear~Teams cannot connect a symptom to the relevant upstream or downstream change.', 'Incident knowledge disappears~Resolved incidents do not become usable evidence for future investigations.'],
      ['Platform engineering teams', 'Permissions complicate rollout~The assistant cannot safely combine telemetry from services with different access rules.', 'Vendor cost is unpredictable~Heavy investigations create inference bills that are hard to forecast.'],
      ['Engineering budget owners', 'Value difficult to prove~Usage does not clearly connect to faster correct diagnosis or fewer disruptions.', 'MVP scope too broad~A general autonomous remediation pitch delays a useful first release.'],
    ],
    solutions: [
      ['Evidence-backed incident brief', 'Assemble relevant telemetry and deploy changes with source links before suggesting causes.', [1,2]],
      ['Dependency-aware hypotheses', 'Rank possible causes using service relationships and incident-time signals.', [3,2]],
      ['Reusable incident memory', 'Turn reviewed incident outcomes into permissioned retrieval evidence.', [4,1]],
      ['Governed model gateway', 'Apply access boundaries, cost budgets, and model comparisons to each investigation.', [5,6]],
      ['Human-led diagnosis MVP', 'Ship a narrow investigative assistant and measure accepted diagnoses before autonomous remediation.', [7,8]],
    ],
    metrics: ['Time to correct diagnosis~Measure elapsed incident time until a reviewer confirms the root cause.', 'Verified investigations completed~Count incidents where the assistant materially supports a correct diagnosis.', 'Contribution per investigation~Compare willingness to pay with inference and operating costs.', 'Guardrail: misleading hypotheses~Audit false leads, unsafe remediation suggestions, and access violations.'],
  },
  newClaudeUsers: {
    scope: 'Claude.ai first-session activation',
    users: [
      ['First-time work users', 'Blank chat is intimidating~Users know their work problem but do not know what context to provide.', 'First output is unusable~A vague initial request produces a draft that does not fit the job.'],
      ['Document-heavy newcomers', 'Upload scope is confusing~Users cannot tell which files are needed or what the assistant will read.', 'No evidence for answers~A new user cannot verify the first document-based output quickly.'],
      ['Returning AI skeptics', 'Expectations are unrealistic~Previous demos lead users to expect reliable autonomous work immediately.', 'Recovery feels difficult~An incorrect first answer provides no clear way to correct the task.'],
      ['Time-constrained professionals', 'Onboarding is too long~Feature tours delay the first useful result.', 'No reason to return~A first successful chat does not connect to a repeatable work need.'],
    ],
    solutions: [
      ['Task-led starting points', 'Offer a small set of editable examples tied to common first-session jobs.', [1,2]],
      ['Visible source selection', 'Explain which files are needed and show the evidence used in a document answer.', [3,4]],
      ['Honest outcome previews', 'Show representative results and what the user still needs to review.', [5,2]],
      ['Guided correction controls', 'Let users adjust intent, sources, or output format without restarting the task.', [6,2]],
      ['Skippable repeat-work setup', 'Reach a useful artifact quickly and optionally save the job for later reuse.', [7,8]],
    ],
    metrics: ['First-session useful outcomes~Count new users producing an artifact they can actually use.', 'Time to first value~Include setup, context upload, generation, and required correction.', 'Seven-day job return~Measure users returning to repeat a useful task within a week.', 'Guardrail: misleading expectations~Track failed first tasks and misunderstandings about autonomous capability.'],
  },
};

const E = (scope, hypotheses, metrics) => ({ scope, hypotheses, metrics });
export const strategyOptions = {
Q012:['Remove low-risk checkpoints~Simplify supervision only where the improved model demonstrates reliable task execution.','Expand the task boundary~Use stronger capability for larger reports while retaining final approval.','Preserve governance primitives~Invest in permissions and provenance that remain useful across model upgrades.','Rebuild model-dependent workarounds~Retire fragile prompt scaffolding after held-out comparisons justify replacement.'],
Q015:['Sell an engineering pilot~Demonstrate faster verified answers on two CTO-owned engineering workflows.','Lead with governance~Resolve source permissions and security review before broad rollout.','Build a financial case~Compare observed engineering effort saved with deployment and licensing costs.','Start with onboarding~Prove value on repeatable new-hire tasks with clear acceptance evidence.'],
Q020:['Start with enterprise support~Use approved knowledge and human-reviewed drafts in measurable high-volume cases.','Choose internal knowledge work~Improve repeat document and policy tasks within enterprise permissions.','Target developer productivity~Support reviewable repository changes with test evidence.','Pursue a regulated vertical~Accept slower validation and expert review for a potentially valuable specialized job.'],
Q030:['Begin with status inquiries~Launch a high-volume read-only workflow with clear source data.','Prioritize reversible resolution~Automate a bounded issue with robust recovery and human handoff.','Build the connector foundation~Resolve shared identity and permission contracts before expanding issue coverage.','Deliver a bespoke showcase~Win a strategic account with a custom flow while explicitly pricing maintenance risk.'],
Q031:['Stabilize production first~Reserve capacity for severe reliability defects before discretionary roadmap work.','Unblock shared deployment needs~Choose the smallest reusable change helping several valuable customers.','Honor credible commitments~Prioritize a dated contract obligation after checking feasibility and impact.','Fund strategic discovery~Protect a limited allocation for evidence on a future growth bet.'],
Q032:['Fix the shared retry defect~Use the week to restore an existing workflow across affected accounts.','Unblock one valuable deployment~Deliver a small integration change with confirmed acceptance cases.','Choose a configuration workaround~Use a reversible account setting instead of building a large new feature.','Investigate before committing~Spend bounded time validating a suspected root cause rather than promise an infeasible implementation.'],
Q034:['Start with agent assistance~Help humans find evidence and draft responses before delegating account actions.','Automate safe self-service~Resolve common low-risk issues with an easy human route.','Improve support operations~Use case summaries and routing to reduce internal coordination effort.','Add bounded account actions~Authorize a narrow set of reversible changes with policy checks and confirmation.'],
Q041:['Prioritize conversational confidence~Offer short realistic role-plays for learners who avoid speaking.','Focus on deliberate correction~Build targeted feedback loops for specific grammar or pronunciation weaknesses.','Partner with instructors~Provide structured practice between human-led lessons.','Create an adaptive curriculum~Use demonstrated skill gaps to sequence practice while measuring transfer to unseen tasks.'],
Q051:['Embed workflow teams~Give cross-functional teams ownership of user outcomes and domain evaluation.','Centralize shared infrastructure~Provide model access, tracing, permissions, and evaluator tooling as platform services.','Use a hybrid model~Keep domain rubrics local while sharing reliable technical primitives.','Create temporary specialist support~Embed scarce research and safety expertise during new high-risk launches without making every team dependent.'],
Q052:['Bet on dependable delegation~Prioritize evaluation and control that move enterprise pilots into production.','Bet on model differentiation~Invest primarily in new capabilities that existing models cannot achieve.','Bet on workflow distribution~Build a small number of applications with repeat customer access.','Bet on developer infrastructure~Make safe reliable tool use and production integration easier across many workflows.'],
Q053:['Explore interactive rehearsal~Test native audio where turn-taking and interruption meaningfully change the job.','Target language practice~Choose a narrow conversational learning outcome with independent assessments.','Build accessible knowledge help~Investigate hands-free work with clear listening and privacy controls.','Validate capability before market~Map latency, language coverage, interruption recovery, and cost before making a commercial commitment.'],
Q060:['Deepen trusted enterprise workflows~Build reliable repeatable outcomes in a few valuable business jobs.','Expand developer delegation tools~Invest in evaluation, permissions, and recovery as reusable infrastructure.','Broaden end-user applications~Use selected applications to learn about customer behavior and distribution.','Stage autonomy by evidence~Fund longer-horizon agent capability while gating exposure on verified reliability.'],
Q061:['Prioritize reviewable changes~Improve plan, diff, and test workflows before broad autonomous refactoring.','Drive enterprise team adoption~Help champions share approved recipes and activate teammates.','Improve administration~Make permissions, spend, and auditability easier for enterprise owners.','Expand autonomous scope~Pursue larger tasks only where accepted-change quality and recovery evidence support it.'],
Q062:['Follow expensive unmet jobs~Rank use cases by observed pain and the new capability’s measurable advantage.','Recruit design partners~Test realistic customer tasks through a concierge prototype.','Explore adjacent existing demand~Start with current customers who already supply relevant data and distribution.','Run broad discovery probes~Compare several narrow prototypes before committing to one segment.'],
Q066:['Optimize for bounded autonomy~Delegate reversible work and gate consequential actions.','Prioritize predictable reliability~Reduce workflow variance before extending the product’s task scope.','Compete on user control~Expose evidence, progress, and recovery as core experience features.','Expand capability frontier~Invest in new model abilities while retaining explicit launch constraints.'],
Q068:['Reject the violating version~Treat an explicit privacy commitment as a product constraint.','Build a consented alternative~Narrow data and action scope while preserving the valuable user job.','Narrow the market~Serve a segment where values and sustainable economics can coexist.','Stop the investment~Decline an opportunity whose compliant version cannot create viable value.'],
Q073:['Own the specialized workflow~Differentiate through domain context and reliable execution rather than generic chat.','Partner for model intelligence~Buy commodity capability and focus engineering on customer outcomes.','Strengthen distribution and trust~Use existing relationships and governance to preserve valuable customer access.','Exit commoditized scope~Stop features foundation-model providers can deliver better at lower cost.'],
Q076:['Route by task difficulty~Use the costly stronger model only where it materially improves outcomes.','Create a premium workflow~Charge for a high-value job whose value justifies stronger capability.','Keep the cheaper default~Retain current economics for routine tasks without meaningful quality gains.','Invest in cost reduction~Improve caching and orchestration before broad access to the expensive model.'],
Q077:['Fix workflow reliability~Resolve repeated orchestration failures before adding platform breadth.','Improve builder activation~Shorten time to a first successful production integration.','Develop a vertical pilot~Use one high-value customer workflow to validate reusable platform needs.','Expand model customization~Choose fine-tuning or specialized tools only when customer evidence identifies a persistent behavior gap.'],
Q084:['Lead with trusted enterprise work~Combine model capability with deployment controls and repeat business value.','Prioritize developer leverage~Build a platform that supports many customer workflows safely.','Fund focused application learning~Use selected products to learn directly from users without broad portfolio sprawl.','Invest in staged autonomy~Pursue longer-horizon delegation with explicit capability and safety gates.'],
Q088:['Launch optional shared planning~Use Instagram discovery context to help people agree an activity in DMs.','Start with creative assistance~Help people compose or remix content before sharing with friends.','Prioritize information inquiries~Offer bounded useful answers with evidence and clear invocation.','Delay broad inbox placement~Validate repeat voluntary value before taking space from unread messages.'],
Q092:['Offer professional subscriptions~Charge frequent high-value users for reliable capacity and workflow features.','Sell governed team plans~Monetize collaboration, administration, and organizational requirements.','Use usage-priced APIs~Serve developers whose costs and value scale with actual workloads.','Keep a bounded free tier~Demonstrate useful value while limiting serving cost and abuse.'],
Q094:['Prioritize loyalty with a holdout~Test whether incentives create incremental retained orders after subsidy costs.','Prototype the food assistant~Validate whether choice friction causes meaningful order abandonment.','Segment the two problems~Offer different interventions to customers with decision versus price barriers.','Defer both for a core fix~Choose checkout or reliability work if evidence shows that is the real ordering bottleneck.'],
Q120:['Roll out through a canary~Expand exposure only while task value and safety thresholds hold.','Launch to a targeted job~Choose one use case with clear user acceptance and operational readiness.','Delay for release evidence~Resolve a material quality or safety gap before public availability.','Separate capability and packaging~Ship a narrower interface while continuing longer-horizon model or workflow work.'],
Q127:['Unify shared project layers~Consolidate identity, billing, assets, and cross-modal continuity.','Keep specialized interfaces~Preserve tools suited to expert image, video, and conversation workflows.','Create one adaptive workspace~Route a shared user task to specialized modes within one project.','Retain separate products~Avoid a costly consolidation until observed cross-product demand justifies it.'],
Q128:['Cap useful free usage~Keep a real first-value experience while limiting expensive repeated consumption.','Charge high-value professionals~Package repeat jobs where willingness to pay exceeds serving cost.','Expand enterprise revenue~Monetize organizational controls and shared workflows with sustainable margins.','Route routine tasks cheaply~Use adequate cheaper models while preserving task quality and trust.'],
Q129:['Improve core user jobs~Use AI to make search and productivity tasks measurably easier.','Defend the workflow interface~Help users act on information before competing assistants own that relationship.','Develop new commercial value~Build paid AI jobs rather than rely only on existing monetization.','Protect ecosystem trust~Invest in sources, privacy, and partner economics while changing answer interfaces.'],
Q130:['Personalize approved footage~Create trailer variants emphasizing legitimate themes from licensed material.','Use editorial segment variants~Start with human-approved versions before generating per-user trailers.','Improve discovery without generation~Test metadata and recommendation changes as a cheaper baseline.','Pilot one catalog segment~Restrict rights and production scope until viewing gains exceed rendering costs.'],
Q131:['Build a feasible itinerary assistant~Ground editable plans in inventory, timing, and budget constraints.','Start with concierge planning~Deliver a narrow destination manually to validate repeat demand.','Partner for bookable inventory~Use supplier systems instead of fabricating availability and prices.','Improve existing booking flows~Prioritize a demonstrated booking bottleneck if AI planning is not the main user need.'],
Q133:['Teach with labeled examples~Use cat and dog pictures to explain learning patterns from practice.','Demonstrate unseen tests~Show why correct guesses on new examples matter more than memorized ones.','Explain a wrong shortcut~Use biased examples to illustrate why the computer can make mistakes.','Use a hands-on sorting game~Let the child build and test a simple rule before discussing computers.'],
Q134:['Assist existing creators~Reduce editing and captioning effort while retaining creator control.','Expand consented dubbing~Help creators reach new audiences with reviewed translations.','Improve grounded discovery~Help viewers find real videos that satisfy their current job.','Explore labeled creation tools~Test generative creation with explicit provenance and rights controls.'],
Q144:['Start with domain retrieval~Ground the product in approved current sources and expert evaluation.','Constrain the workflow~Use structured outputs and qualified review for consequential decisions.','Fine-tune a proven gap~Customize behavior only after simpler approaches fail on repeated domain needs.','Partner with domain experts~Build task labels, failure thresholds, and validation evidence before expanding use.'],
Q146:['Build a creator-first portfolio~Prioritize tools that improve existing creators’ outcomes.','Expand global audience access~Invest in consented translation and dubbing with quality review.','Improve viewer discovery~Use AI to find relevant trustworthy content without flooding supply.','Run bounded creation experiments~Explore new formats with clear rights, provenance, and ecosystem stop criteria.'],
Q149:['Validate the scientific claim~Require independent evidence for the hypothetical communication capability.','Start with observable behavior~Offer a bounded caregiver diary rather than a literal animal translator.','Partner with qualified specialists~Use expert supervision and appropriate follow-up for ambiguous signals.','Avoid unsupported commercialization~Stop if persuasive outputs exceed validated information value.'],
Q150:['Choose opt-in planning~Help users coordinate around Instagram content without forcing inbox prominence.','Start with creator assistance~Support editable content ideas that users deliberately share.','Test a narrow answer job~Use bounded inquiries to establish repeated useful assistance.','Preserve human messaging first~Delay broad AI placement until incremental outcomes exceed displacement.'],
Q153:['Profile the input pipeline~Identify data loading, preparation, and storage delays before adding compute.','Optimize compute utilization~Measure memory, kernels, synchronization, and checkpoint overhead.','Improve experiment throughput~Reduce evaluation and decision delays that block useful model iteration.','Scale only after diagnosis~Buy capacity when a measured end-to-end bottleneck justifies the cost.'],
Q159:['Keep unread messages primary~Protect the inbox’s established human-communication job by default.','Offer optional AI pinning~Let demonstrated AI users choose prominent placement.','Test a smaller AI entry~Preserve discovery without displacing the main unread-message surface.','Segment placement by evidence~Use randomized cohort results to choose a policy based on net value.'],
Q165:['Explain a concrete architecture~Connect retrieval, models, tools, permissions, state, and evaluation in one workflow.','Walk through a failed trace~Demonstrate how evidence isolates a technical failure and guides a fix.','Compare simple and agentic designs~Add planning complexity only when held-out task value justifies it.','Clarify personal ownership~Distinguish product decisions from engineering implementation without inventing experience.'],
Q167:['Commit to durable foundations~Plan ahead for infrastructure and customer needs robust to model changes.','Stage large bets~Break long projects into evidence-producing milestones and stop options.','Keep capability plans short~Revise detailed implementation when model assumptions change.','Use explicit review triggers~Revisit commitments when demand, economics, or capability evidence crosses a threshold.'],
};
export const executionProfiles = {
  Q003:E('Claude enterprise developer API feature',[
    'Integration friction blocks production~Developers make a valid test call but cannot deploy the extraction workflow.','Retries inflate apparent adoption~Growing API traffic comes from repeated failed jobs rather than additional customer value.','Quality prevents repeat usage~Schema-valid responses contain incorrect fields that customers must repair.','Value supports account expansion~Teams repeat verified extraction jobs and add production workloads.'
  ],['Verified production jobs~Count accepted extraction jobs passing schema and field-accuracy checks.','Production activation~Measure eligible developer accounts reaching a real production workload.','Retained applications~Track production applications completing verified jobs across weeks.','Guardrail: job economics~Monitor cost per accepted job, severe errors, and p95 latency.']),
  Q004:E('Claude feature productivity experiment',[
    'Drafting gains survive review~The feature reduces total work time while maintaining the required output quality.','Correction erases apparent savings~Users draft faster but spend more time repairing and verifying outputs.','Task mix explains the gain~Assistant users choose easier work than the control group.','Learning effects change outcomes~Benefits appear only after users learn how to supervise the workflow.'
  ],['Accepted tasks per labor hour~Include preparation, generation, review, and downstream repair.','Blinded output quality~Have independent reviewers score equivalent finished tasks.','Correction effort~Measure minutes spent checking and fixing generated work.','Guardrail: consequential defects~Track material errors and quality regressions by task difficulty.']),
  Q005:E('15% Claude feature DAU decline',[
    'Instrumentation changed~A release or tracking definition stopped counting some legitimate active users.','Release regression reduced success~A model or client change made a previously useful workflow fail.','Acquisition mix weakened~Fewer new high-intent users reached the feature while retained users stayed stable.','Demand shifted legitimately~Seasonality or fewer required tasks reduced usage without lowering useful outcomes.'
  ],['Meaningful DAU by cohort~Decompose new, retained, and resurrected users with a stable definition.','Verified task success~Compare task outcomes before and after the change point.','Funnel conversion~Locate the first affected step from exposure through useful completion.','Guardrail: quality and latency~Monitor errors, p95 latency, complaints, and cohort retention.']),
  Q006:E('enterprise model release evaluations',[
    'Workflow gains generalize~The new model improves customer tasks on a held-out representative suite.','Average gains hide slice failures~Important languages, customer domains, or task types regress despite a higher overall score.','Tool authority regresses~The model follows injected instructions or attempts unauthorized business actions.','Judge scores are misleading~Automated evaluators reward fluent answers without independent evidence of correctness.'
  ],['Held-out workflow completion~Use expert-defined acceptance criteria on realistic enterprise jobs.','Severity-specific failure rate~Report consequential failures separately from minor quality issues.','Judge-human agreement~Audit evaluator labels against independent expert reviewers.','Guardrail: launch regressions~Compare privacy, tool safety, refusal, latency, and cost against the current model.']),
  Q007:E('Anthropic platform adoption slowdown',[
    'Visibility brings weak intent~Growing awareness produces signups that do not have a real production job.','Security review blocks conversion~Successful prototypes stall before enterprise approval.','Integration cost is excessive~Developers cannot connect required data and workflows economically.','Pilot quality fails expectations~Early users do not retain because real tasks require too much correction.'
  ],['Production conversion~Track organizations progressing from qualified trial to deployed workload.','Time in funnel stage~Measure delays at integration, security review, procurement, and launch.','Retained production workloads~Measure repeated verified customer jobs rather than raw calls.','Guardrail: unit economics~Track serving cost, customer implementation effort, and churn.']),
  Q010:E('Claude enterprise value and risk measurement',[
    'Safe useful output increases~Teams complete more approved customer responses without violating policy.','Refusal masks low utility~The feature reduces risky answers by refusing legitimate requests.','Review burden erases benefit~Operators must inspect so much content that response productivity falls.','Rare severe errors hide in averages~Overall accuracy improves while a consequential error class worsens.'
  ],['Accepted compliant responses~Count useful approved outputs passing policy and quality checks.','End-to-end response effort~Include user review, correction, and escalation time.','Unnecessary refusal rate~Audit safe legitimate requests the assistant fails to complete.','Guardrail: consequential violations~Track disclosure, incorrect commitments, and high-impact unsupported claims.']),
  Q011:E('confident incorrect answers in consequential contexts',[
    'Evidence is unavailable~The assistant answers despite missing trustworthy information for the task.','Grounding is incorrect~Available sources do not actually support the answer’s consequential claims.','Confidence cues encourage reliance~The interface makes uncertain output appear authoritative.','Review boundary is insufficient~Unverified answers are allowed to trigger consequential downstream actions.'
  ],['Consequential error rate~Use qualified reviewers to check high-impact factual claims.','Verified safe completion~Measure tasks completed usefully within evidence and authority limits.','Appropriate abstention~Check whether the assistant pauses when evidence is genuinely insufficient.','Guardrail: unsafe reliance~Audit unauthorized actions and severe errors reaching downstream users.']),
  Q018:E('AI behavior reliability and calibrated trust',[
    'Behavior matches user expectations~Users correctly predict when the assistant needs supervision.','Fluency causes over-reliance~Persuasive responses lead users to trust unsupported outputs.','Controls create unnecessary avoidance~Users abandon safe useful tasks because boundaries are confusing.','Recovery rebuilds trust~Visible evidence and correction paths improve willingness to reuse the system.'
  ],['Verified workflow success~Measure correct completion in each stated product task.','Appropriate reliance~Test whether users accept good outputs and question flawed ones.','Correction and override effort~Measure work needed to detect and repair failures.','Guardrail: severe failures~Track harm, privacy, unauthorized actions, and unresolved incident classes.']),
  zoom:E('Zoom AI notes and declining attendance',[
    'Asynchronous substitution is healthy~Informational attendees skip meetings while commitments and decisions improve.','Decision participants are missing~People required for live decisions incorrectly rely on notes alone.','Notes are incomplete or wrong~Attendees miss context because generated summaries omit material information.','Distribution changes expose information~Automatic transcript recipients create a privacy or access problem.'
  ],['Decisions and commitments completed~Measure whether collaboration produces the intended follow-through.','Repeat coordination meetings~Track extra meetings needed to repair missed context or decisions.','Required-attendee participation~Separate decision participants from optional informational attendees.','Guardrail: note trust~Audit note accuracy, recipient permissions, and collaboration satisfaction.']),
  Q024:E('Perplexity guardrail breach response',[
    'Quality regression is localized~A specific topic or release causes unsupported consequential claims.','Citation quality is degrading~Sources appear credible but do not entail answer claims.','Alert is a sampling artifact~A small or changed audited sample produces a noisy breach.','A severe incident needs containment~A privacy or high-impact safety failure warrants limiting exposure immediately.'
  ],['Verified research outcomes~Measure useful conclusions that pass independent evidence review.','Citation entailment~Audit whether each cited passage supports its factual claim.','Incident detection and recovery~Measure time to identify, contain, and fix an affected failure class.','Guardrail: severe exposure~Track harmful claims and privacy violations with explicit stop criteria.']),
  Q033:E('enterprise agent declining key metric',[
    'Measurement denominator changed~The metric moved because eligible case volume or tracking changed.','Connector failures reduce completion~A tool or integration outage prevents valid customer workflows.','Traffic mix became harder~More complex cases lower the aggregate result without a within-case regression.','Customer value has weakened~Repeated users abandon the workflow because verified resolution quality fell.'
  ],['Verified case resolution~Measure correct outcomes without repeat contact.','Eligible-case conversion~Track exposure, start, completion, and successful human escalation.','Outcome by account and case~Compare stable cohorts and issue types across the change point.','Guardrail: customer impact~Track severe errors, latency, cost, and valuable-account retention.']),
  Q035:E('Sierra Spotify prioritization and live metrics case',[
    'Playback workflow has best value~A bounded high-volume playback issue offers the strongest feasible first integration.','Data readiness dominates priority~A smaller issue with reliable account context can launch sooner than a larger unsupported one.','Decline reflects changed case mix~A new device or market cohort makes the aggregate resolution metric worse.','Handoff failure hides unresolved cases~The agent appears to contain cases that customers cannot actually resolve.'
  ],['Correct resolution without repeat contact~Use independently checked case outcomes over a defined window.','Eligible issue coverage~Track which support cases the proposed MVP can responsibly handle.','Cost per verified resolution~Include human escalation and integration operating cost.','Guardrail: failed handoff~Measure unresolved customers unable to reach effective human help.']),
  Q036:E('Claude coding thumbs-down among nontechnical users',[
    'Requirements are misunderstood~Users cannot express enough detail for the generated program to meet intent.','Code cannot run successfully~The output is plausible code but fails installation or execution.','Setup overwhelms users~Nontechnical users cannot perform the steps needed to see a working artifact.','Feedback sample is biased~The observed 40% figure reflects changed feedback exposure or a difficult task mix.'
  ],['Working outputs per attempted task~Use executable and user-intent acceptance checks.','Completion time including setup~Measure time to a usable artifact, not code generation alone.','Negative feedback by failure class~Separate intent, execution, setup, and explanation failures.','Guardrail: unsafe execution~Track harmful commands, data exposure, and support burden.']),
  Q037:E('ChatGPT factual hallucination reduction without model research',[
    'Retrieval misses critical evidence~The answer generator lacks the source facts needed for a correct response.','Synthesis invents unsupported claims~The model adds facts that are absent from otherwise useful retrieved evidence.','Verification shares the same error~A second model pass confidently endorses the original false claim.','Abstention improves apparent accuracy~The system answers fewer difficult questions without improving useful coverage.'
  ],['Unsupported factual claims~Audit claim-level grounding on a fixed held-out test set.','Useful answer coverage~Measure legitimate questions completed rather than refused.','Cost per verified answer~Include retrieval, verification, and retries.','Guardrail: consequential errors~Track severe factual mistakes and latency regressions.']),
  bias:E('demographic bias in AI product outcomes',[
    'Data coverage is uneven~The system has less representative evidence for some demographic groups.','Retrieval introduces disparity~The sources surfaced differ in relevance or quality across user groups.','Prompts encode irrelevant cues~Unnecessary demographic information changes otherwise equivalent outcomes.','Aggregate averages hide harm~Overall quality masks worse error rates for an intersectional group.'
  ],['Task quality by slice~Evaluate the relevant outcome across demographic and intersectional groups.','Harmful error disparity~Compare severity-specific mistakes with sample uncertainty.','Counterfactual consistency~Test matched cases changing only irrelevant demographic cues.','Guardrail: lost legitimate utility~Audit refusals and removal of context needed for valid tasks.']),
  Q043:E('Meta internal document and code chatbot',[
    'Retrieval reduces interruptions~Employees find correct answers without asking teammates.','Stale sources lower trust~The bot cites old document or code revisions.','Code and document jobs differ~One aggregate metric hides poor performance on repository navigation.','Permission boundaries fail~The assistant returns information an employee cannot access directly.'
  ],['Verified work tasks completed~Count useful answers that help finish an actual employee job.','Time to verified answer~Include source checks and any teammate follow-up.','Retained workflow usage~Segment repeat use by document Q&A and code navigation.','Guardrail: restricted information~Audit source access, snippets, and sensitive code exposure.']),
  Q044:E('Meta internal AI deployment value',[
    'Onboarding improves materially~Employees complete required early work with less total effort.','License adoption is superficial~People activate the tool but do not complete repeat valuable tasks.','Savings move downstream~Reported speed gains create rework for reviewers or colleagues.','Team differences explain results~Early adopting teams already have better documentation or stronger performance.'
  ],['Accepted work per labor hour~Measure complete workflows including review and rework.','Time to employee proficiency~Compare onboarding outcomes on equivalent role-specific tasks.','Retained valuable workflows~Measure recurring use tied to observed work output.','Guardrail: data and quality~Track sensitive-data incidents, correction effort, and operating cost.']),
  Q045:E('Claude Code within-enterprise virality',[
    'Setup blocks teammate activation~Champions get value but colleagues cannot reproduce their approved configuration.','Recipes enable useful sharing~A successful repository task creates a repeatable colleague invitation loop.','Invites create low-quality trials~Many teammates try the product without completing or repeating useful tasks.','Security friction limits spread~Shared context or permissions require administrative review before reuse.'
  ],['Invited teammate activation~Count invitees completing a verified first repository task.','Retained active teams~Measure teams repeating accepted coding workflows.','Successful recipe reuse~Track shared recipes producing accepted changes for another developer.','Guardrail: unsafe sharing~Audit exposed secrets, unauthorized repository access, and spam invitations.']),
  Q049:E('Claude context handling',[
    'Relevant evidence is omitted~The context builder drops facts needed for the task.','Long context obscures evidence~Necessary information is present but not reliably used by the model.','Summaries lose exceptions~Compression removes a constraint or contradictory source detail.','Source updates invalidate state~The assistant reuses outdated context after a document changes.'
  ],['Long-task verified success~Measure complete tasks across realistic project sizes.','Evidence-position accuracy~Test required facts placed at different input locations.','Constraint preservation~Audit exceptions and user corrections across context compression.','Guardrail: cost and freshness~Track stale-context errors, latency, and input-token cost.']),
  Q056:E('Datadog AI usage, CEO dashboard, and discounts',[
    'Low usage reflects rare eligibility~Few incidents occur even though eligible users find investigations valuable.','Quality blocks repeat adoption~Users abandon the assistant after misleading diagnostic leads.','Executive metrics lack outcomes~The dashboard emphasizes activity rather than retained value and economics.','Discount demand signals fit issues~The large customer questions value rather than merely negotiating price.'
  ],['Correct diagnosis effort~Measure incident time saved after verification and repair.','Eligible incident adoption~Measure meaningful use when an appropriate incident actually occurs.','Account contribution and retention~Compare revenue, discount terms, serving cost, and renewal risk.','Guardrail: incident harm~Track misleading hypotheses, unsafe remediation, and severe service outcomes.']),
  Q058:E('agent evaluation platform versus application ownership',[
    'Application rubric is missing~Shared evaluators cannot judge the customer’s actual workflow correctly.','Evaluation labels are inconsistent~Teams disagree on success and failure severity across similar traces.','Platform feedback is too slow~Running and diagnosing regressions delays product iteration.','Offline tests miss production~The suite fails to represent observed customer incidents and tool failures.'
  ],['Human-validated task success~Judge end-to-end outcomes using domain-specific criteria.','Judge-human agreement~Audit automated evaluation decisions against expert labels.','Regression turnaround time~Measure time to detect and diagnose a meaningful release regression.','Guardrail: escaped failures~Track severe production failures absent from pre-release evaluation.']),
  codingMetrics:E('AI coding task and north-star measurement',[
    'Accepted code reflects real value~Completed changes meet intent, pass checks, and survive maintainer review.','Acceptance hides later rework~Suggestions are accepted quickly but reverted or repaired after review.','Easy task selection inflates gains~Assistant tasks are simpler than comparison tasks.','Review cost erases speed~Generation time falls while verification and debugging effort rises.'
  ],['Reviewed task completions~Count repository changes accepted after relevant tests and human review.','Review-inclusive completion time~Include setup, generation, review, debugging, and rework.','Retained successful developers~Measure recurring developers completing useful tasks.','Guardrail: escaped defects~Track post-merge bugs, security flaws, and unauthorized commands.']),
  Q065:E('helpfulness and harmlessness release criteria',[
    'Useful safety improves~The candidate model completes more legitimate work without harmful compliance.','Refusals conceal low quality~Lower harm comes from refusing benign tasks.','Safety regressions are localized~A language or task category worsens despite strong overall results.','Adversarial tests miss novel attacks~Known attack success improves without robust generalization.'
  ],['Verified helpful completions~Measure legitimate tasks completed correctly.','Harmful compliance by severity~Separate consequential failure classes and exposure.','Unnecessary benign refusal~Test paired safe requests resembling unsafe cases.','Guardrail: slice regressions~Audit language, cohort, latency, and severe-harm changes.']),
  Q069:E('10x Claude Code weekly active growth',[
    'Activation is the main bottleneck~Interested developers fail before their first accepted code task.','Team sharing creates expansion~Champions can invite colleagues into repeatable approved workflows.','Retention is insufficient~Acquisition creates trials but not recurring useful weekly work.','Reach limits the growth target~The accessible segment cannot plausibly produce the required new retained users.'
  ],['Weekly successful developers~Count users completing useful reviewed repository tasks each week.','First-task activation~Measure eligible trials reaching a verified first outcome.','Team invite retention~Track invited colleagues repeating meaningful use.','Guardrail: growth quality~Track escaped defects, serving cost, and paid-team retention.']),
  instagram:E('Meta AI useful assistance in Instagram DMs',[
    'AI complements human planning~People turn shared inspiration into an agreed useful plan.','Prominence manufactures activity~A more visible entry point increases trials without retained task value.','AI displaces valuable messages~Assistant engagement rises while important human conversations suffer.','Novelty fades after trial~Fun exchanges generate early activity but little recurring useful assistance.'
  ],['Weekly useful-task people~Count people completing a user-confirmed and sample-audited AI job.','Successful sessions per exposed user~Use stable eligibility and avoid rewarding failed retries.','Retained voluntary task use~Track repeat use for the same valuable job.','Guardrail: DM health~Measure human-message response, missed conversations, privacy, and harmful output.']),
  Q075:E('OpenAI success measurement and instrumentation outage',[
    'Useful retained tasks predict value~Repeat verified outcomes correlate with product and business health.','Activity proxies are misleading~Messages or tokens rise without increased successful work.','Partial signals remain trustworthy~Billing and service logs provide limited independent evidence during the outage.','Backfill duplicates distort recovery~Restored events contain repeated identifiers or incorrect timestamps.'
  ],['Retained useful-task customers~Measure recurring verified value for the relevant product segment.','Paid retention and contribution~Compare commercial sustainability with serving costs.','Independent service health~Use redundant availability and error monitoring during missing event data.','Guardrail: data integrity~Track missing, duplicated, delayed, and unverifiable measurements.']),
  Q080:E('new evidence contradicting a product plan',[
    'Core assumption is falsified~Reliable new evidence contradicts the value or safety premise behind the roadmap.','Observed difference is noise~A weak sample or measurement change creates an apparent contradiction.','Context differs from target~The new evidence comes from a segment unlike the planned customer.','Plan needs a smaller revision~The user need remains valid but a solution or delivery assumption has changed.'
  ],['Original success criterion~Evaluate new evidence against the outcome agreed before building.','Evidence coverage and quality~Measure sample relevance, reliability, and uncertainty.','Cost of irreversible commitment~Track exposure created by continuing before resolving the contradiction.','Guardrail: decision churn~Avoid repeated reversals driven by unverified small fluctuations.']),
  Q081:E('mission-linked AI research north-star design',[
    'Task outcomes reflect the mission~Verified useful research conclusions indicate actual user benefit.','Conversation length rewards confusion~More messages mainly reflect unresolved research.','Retention captures lasting value~Users return because the research job succeeds repeatedly.','Confirmation overstates accuracy~Users approve plausible answers that independent evidence does not support.'
  ],['Weekly verified research users~Count people completing an independently calibrated useful research task.','Successful tasks per active user~Measure useful depth without counting repeated failures.','Retained research cohorts~Track repeat value after initial discovery.','Guardrail: unreliable conclusions~Audit unsupported claims, privacy violations, and excessive cost.']),
  Q083:E('free AI retention, low conversion, and usage growth',[
    'High-value job remains underused~Retained free users have a repeat workflow the product does not support well.','Paid value is poorly packaged~Users cannot see a meaningful reason to upgrade.','Free activity is uneconomic~Doubling usage worsens contribution without increasing paid value.','Paywall harms the retention advantage~Stricter limits prevent the free tier’s first useful outcome.'
  ],['Meaningful daily active users~Count people completing useful daily tasks.','Retained paid conversion~Track upgrades that remain paid after actual product use.','Contribution per customer~Include free serving expense and paid-user margin.','Guardrail: trust and retention~Monitor lost useful access, satisfaction, and cohort churn.']),
  Q090:E('ChatGPT rising response thumbs-down',[
    'Feedback exposure changed~A new UI makes negative feedback easier to submit.','Model release reduced quality~The rise aligns with a model or system-prompt change on stable tasks.','Harder traffic changes the mix~New topics or languages produce more difficult response requests.','Latency or refusal drives dissatisfaction~Users reject responses because they are delayed or unnecessarily refused rather than factually wrong.'
  ],['Negative rate per exposure~Use feedback-eligible responses as the denominator.','Audited response success~Independently label sampled positive, negative, and unrated answers.','Cohort change-point metrics~Segment by task, language, client, plan, and model version.','Guardrail: retained usefulness~Track task success, repeat use, severe errors, and p95 latency.']),
  Q099:E('Instagram AI north-star movement diagnosis',[
    'Task value changed genuinely~The number of people completing useful AI jobs changed within stable cohorts.','Placement changes explain movement~Exposure rose or fell without a change in underlying task value.','Measurement definition shifted~An event or successful-session rule altered the reported north star.','Human messaging tradeoff worsened~AI gains displace useful conversations or inflate repeated failed sessions.'
  ],['Audited weekly useful-task people~Reconcile the reported north star with independent samples.','Exposure-to-success funnel~Separate eligibility, discovery, start, completion, and retention.','Task-level retained value~Compare stable jobs and users over time.','Guardrail: messaging health~Track missed conversations, human response time, and satisfaction.']),
  Q101:E('Instagram AI placement and music-video expansion',[
    'Top placement creates net value~Prominent AI entry improves useful outcomes more than it disrupts messages.','Placement cannibalizes unread messages~Trial gains come at the expense of important human responses.','Multimodal inputs solve a real job~Music or video improves shared discovery or planning completion.','Novelty raises cost without value~Multimodal interactions increase activity but not retained useful outcomes.'
  ],['Incremental useful task completion~Compare placement and modality variants against holdouts.','Retained multimodal usefulness~Measure repeated tasks helped specifically by music or video.','Cost and latency per task~Include media processing and retries.','Guardrail: inbox displacement~Track unread-message response, privacy, and harmful media.']),
  Q108:E('LLM context-window tradeoffs',[
    'Longer context preserves dependencies~Tasks need relationships that a shorter window omits.','Irrelevance degrades reasoning~More text distracts the model from decisive evidence.','Retrieval beats full context~A smaller selected evidence set achieves equivalent quality with lower cost.','Position sensitivity limits gains~Facts are present but the model fails when they occur in difficult input positions.'
  ],['Quality by input length~Evaluate the same tasks across context configurations.','Evidence-position accuracy~Move decisive facts while holding task meaning constant.','Cost and p95 latency~Measure full inference and retrieval expense.','Guardrail: missed constraints~Track omitted exceptions and injected-instruction compliance.']),
  Q109:E('inputs longer than model context limits',[
    'Chunk boundaries split dependencies~Related evidence is separated and not retrieved together.','Compression loses exceptions~Summaries omit numbers, caveats, or exact requirements.','Hierarchical retrieval preserves evidence~Relevant original spans restore details missing from compressed context.','Repeated summaries compound mistakes~An early compression error propagates through later stages.'
  ],['Long-input task accuracy~Measure complete tasks on inputs exceeding the window.','Critical constraint recall~Audit exact facts and exceptions needed for correctness.','Source-backed cross-section reasoning~Test relationships across distant document sections.','Guardrail: budget and freshness~Track token cost, latency, and stale summaries after source changes.']),
  Q113:E('Claude.ai monthly active-user KPIs',[
    'New-user activation improves~More first-time users complete a meaningful task and return.','Retention drives active growth~Existing useful-task cohorts remain active across months.','Resurrection explains growth~Previously inactive users return for a new repeated job.','Open events overstate value~The app records more visits without useful task completion.'
  ],['Meaningful monthly active people~Count distinct people completing a defined useful task in the month.','Monthly cohort retention~Track recurring task value within acquisition cohorts.','Activation and resurrection~Separate first use from returning previously inactive users.','Guardrail: quality and economics~Measure errors, satisfaction, serving cost, and paid retention.']),
  syntheticSocial:E('hypothetical AI-generated social content product',[
    'Discovery supports real creativity~People use content to develop an idea or create something worthwhile.','Synthetic supply outpaces value~Generated posts rise without improved viewer satisfaction.','Novelty does not retain users~Initial exploration fails to create repeated useful sessions.','Recommendations narrow diversity~Optimization creates repetitive exposure and crowds out meaningful discovery.'
  ],['Satisfied useful sessions~Count users reporting a worthwhile creative or discovery outcome.','Retained creators and viewers~Measure supply and demand cohorts separately.','Creative follow-through~Track useful saves, edits, remixes, or subsequent projects.','Guardrail: content trust~Audit harmful content, rights complaints, provenance, and compute cost.']),
  Q118:E('estimating worldwide ChatGPT monthly active people',[
    'Reach assumptions dominate estimate~Access constraints materially reduce the connected population eligible to use the product.','Awareness drives trial variation~Large regions differ in awareness and willingness to try.','Monthly retention is overestimated~Registered or trial accounts do not all represent monthly active people.','Account overlap inflates totals~Workplace use, multiple accounts, and shared devices double-count individuals.'
  ],['Assumption-based MAU estimate~Multiply reachable population, awareness, trial, and monthly retention.','Sensitivity range~Vary the least-certain conversion assumptions explicitly.','Independent anchor consistency~Compare the estimate with any supplied verified survey or traffic evidence.','Guardrail: double counting~Deduplicate people and avoid presenting illustrative arithmetic as current fact.']),
  Q126:E('doubling Claude MAU without research expansion',[
    'Activation has scalable headroom~Interested new users fail before the first useful task.','Retention can support growth~A valuable repeat workflow increases recurring monthly use.','Distribution expands reachable demand~Sharing or localization reaches users with a demonstrated job.','Target exceeds feasible funnel gains~The reachable market and conversion improvements cannot justify a six-month doubling.'
  ],['Meaningful MAU growth~Count distinct users completing useful monthly work.','Activated retained cohorts~Measure first-task success and subsequent return by channel.','Growth contribution by lever~Estimate incremental retained users from each tested intervention.','Guardrail: growth economics~Track serving cost, acquisition efficiency, quality, and safety.']),
  Q138:E('Candy Crush early retention and ML CRM',[
    'Core experience causes the drop~Difficulty, crashes, or weak early progression drives new-user abandonment.','Campaign targets organic returners~A churn model selects users who would return without a message.','Relevant prompts create incremental return~Consented reminders help a recoverable cohort resume enjoyable play.','Incentives and fatigue erase gains~More sessions result from subsidies or intrusive notifications that hurt long-term value.'
  ],['Incremental retained players~Compare return behavior against a persistent no-message holdout.','Enjoyable retained sessions~Measure lasting play quality rather than immediate notification opens.','Net contribution after incentives~Include campaign, reward, and operating costs.','Guardrail: notification fatigue~Track opt-outs, complaints, and excessive repeated messages.']),
  Q143:E('Meta AI useful tasks in WhatsApp',[
    'Optional help improves coordination~Users complete practical tasks that complement human messaging.','Context access reduces trust~People avoid the assistant because sharing scope is unclear.','Novelty creates shallow adoption~Trials do not turn into repeated useful work.','AI disrupts private communication~Assistant interactions make human conversations harder to manage.'
  ],['Weekly useful-task people~Count users completing a verified helpful WhatsApp AI job.','Voluntary retained use~Track repeat task completion after an explicit first invocation.','Success per eligible exposure~Separate discovery from actual useful outcomes.','Guardrail: messaging trust~Track human-message health, opt-outs, privacy incidents, and harmful output.']),
  Q154:E('Instagram AI north star versus search decline',[
    'AI is healthy search substitution~Users complete the same discovery jobs more successfully through AI.','Search value is being lost~Lower search use reduces creator discovery or useful information access.','Double counting inflates AI gains~One discovery journey is counted as several successful AI tasks.','Placement shifts behavior mechanically~Users follow the promoted surface without an incremental outcome improvement.'
  ],['Combined verified discovery~Measure successful discovery jobs across search and AI.','Incremental satisfied users~Compare retained value against an untreated user holdout.','Creator reach quality~Track whether useful discovery still connects people with relevant creators.','Guardrail: ecosystem displacement~Audit lost search success, human interaction, latency, and cost.']),
  Q157:E('Meta AI strategic investment measurement',[
    'Existing distribution creates useful adoption~Meta’s surfaces help users discover valuable AI jobs.','Forced placement hides weak demand~Prominence creates trials that do not retain voluntarily.','Cross-surface value is incremental~AI improves creation or communication without harming existing jobs.','Serving cost exceeds benefit~Engagement gains fail to justify compute and opportunity cost.'
  ],['Verified useful tasks~Measure outcomes within each funded customer job.','Retained voluntary users~Distinguish repeated demand from placement-driven trial.','Incremental business contribution~Include serving and displaced-product costs.','Guardrail: ecosystem health~Track human interaction, satisfaction, privacy, and harmful output.']),
};

Object.assign(productProfiles, {
  careerCoach: {
    scope: 'AI career-coach interview preparation',
    users: [
      ['Career switchers','Experience does not translate~Candidates cannot connect previous work to the new role’s requirements.','Advice is too generic~Feedback ignores the actual job description and candidate evidence.'],
      ['Early-career applicants','No realistic practice~Candidates cannot rehearse role-specific questions with useful follow-ups.','Progress is invisible~More practice sessions do not show whether interview performance improved.'],
      ['Experienced job seekers','Stories lack evidence~Good experience is presented without clear decisions and observable results.','Feedback lacks prioritization~Too many suggestions hide the one weakness worth practicing next.'],
      ['Training program operators','Coaching capacity is limited~Human coaches cannot provide frequent individualized practice to every learner.','AI invents achievements~Generated answers add unsupported accomplishments to a candidate’s history.'],
    ],
    solutions: [
      ['Evidence-to-role mapping','Connect truthful candidate experience to explicit job requirements.',[1,5]],
      ['Role-specific mock interviews','Offer short practice loops with follow-ups tied to the target role.',[2,3]],
      ['Blinded progress reviews','Compare practice responses using a consistent independent interview rubric.',[4,6]],
      ['Weekly practice plan','Choose one demonstrated weakness and schedule focused exercises.',[6,7]],
      ['Truth-preserving answer editor','Require candidate evidence and flag unsupported personal claims.',[5,8]],
    ],
    metrics: ['Assessed interview improvement~Measure blinded rubric gains on unseen role-specific questions.','Retained practice completion~Track users completing repeated focused practice sessions.','Paid coaching retention~Measure renewals after users experience actual feedback.','Guardrail: fabricated achievements~Audit suggested answers for unsupported personal claims.'],
  },
  researchDelta: {
    scope:'Perplexity recurring evidence research',
    users:[
      ['Market research analysts','Changes are hard to isolate~Analysts reread long answers to learn what changed since the previous review.','Sources conflict silently~New evidence contradicts an earlier conclusion without a visible alert.'],
      ['Product strategy teams','Updates lack significance~Frequent new links do not explain whether a decision should change.','Research ownership unclear~Nobody knows which evidence was checked and approved by a teammate.'],
      ['Professional fact-checkers','Citations do not entail claims~Linked sources fail to support the stated research conclusion.','Freshness is ambiguous~A recent-looking answer relies on outdated underlying material.'],
      ['Time-constrained subscribers','Alerts are noisy~Users receive updates without material new information.','Cannot limit source scope~Monitoring includes sources the user does not trust or need.'],
    ],
    solutions:[
      ['Evidence-delta brief','Show supported changes relative to the previous saved research conclusion.',[1,2]],
      ['Decision relevance controls','Let teams specify which changes are material to their current decision.',[3,7]],
      ['Claim-source comparison','Show exact supporting passages and conflicting evidence for each update.',[2,5]],
      ['Shared review history','Record source timestamps and teammate approval of research conclusions.',[4,6]],
      ['Opt-in monitoring cadence','Limit monitoring to user-selected sources and a chosen frequency.',[7,8]],
    ],
    metrics:['Accepted research updates~Count updates users verify as useful to a live decision.','Verification effort~Measure time to check a changed conclusion against its evidence.','Retained saved questions~Track recurring research jobs users continue monitoring.','Guardrail: missed material changes~Audit missed updates and unsupported change claims.'],
  },
  codeReview: {
    scope:'VS Code AI pull-request review',
    users:[
      ['Pull-request authors','Findings lack diff context~A chat response does not identify the exact changed code requiring attention.','Fixes change unrelated code~Suggested patches expand beyond the reviewed issue.'],
      ['Maintainer reviewers','False positives consume attention~Low-value findings add more review work than they save.','Evidence is missing~The reviewer cannot reproduce why a finding is a genuine defect.'],
      ['Security-conscious teams','Repository context leaks~The review uploads code or secrets beyond approved boundaries.','Dangerous patches look plausible~A proposed fix introduces a new security weakness.'],
      ['Junior developers','Feedback is hard to understand~A terse issue label gives no explanation of the failing behavior.','No safe way to revert~Accepted edits cannot easily be compared or undone.'],
    ],
    solutions:[
      ['Diff-linked findings','Place prioritized findings on exact changed lines with an explanation.',[1,5]],
      ['Reproducible defect evidence','Attach a test or minimal failure scenario to a high-confidence finding.',[3,4]],
      ['Scoped patch preview','Show proposed changes without applying them until the developer accepts.',[2,6]],
      ['Approved context boundary','Respect repository policy and exclude secrets before model processing.',[5,6]],
      ['Explain-and-revert controls','Explain the defect in plain language and preserve reversible edit history.',[7,8]],
    ],
    metrics:['Valid findings acted on~Count independently confirmed defects addressed after AI review.','Review-inclusive time~Include reading false positives and verifying patches.','Accepted patches passing checks~Measure fixes that survive tests and maintainer review.','Guardrail: harmful edits~Audit new defects, scope expansion, and repository-data exposure.'],
  },
  shoppingFraud: {
    scope:'shopper-facing e-commerce fraud detection',
    users:[
      ['High-value item shoppers','Merchant trust is unclear~Buyers cannot verify whether an unfamiliar seller is legitimate.','Listings misrepresent products~Descriptions and images hide a mismatch with the delivered item.'],
      ['Price-sensitive shoppers','Cheap offers conceal risk~A low price distracts from suspicious return or payment conditions.','Warnings lack explanation~A risk badge gives no evidence the shopper can inspect.'],
      ['Legitimate small merchants','False flags damage sales~New sellers can be labeled suspicious because little history exists.','No effective appeal route~A merchant cannot correct inaccurate fraud signals.'],
      ['Marketplace trust teams','Evidence is fragmented~Fraud reports, listing history, and transaction signals are hard to reconcile.','Fraud tactics evolve~Sellers adapt behavior to evade a static risk score.'],
    ],
    solutions:[
      ['Evidence-backed seller cards','Explain merchant history and verified trust signals without claiming certainty.',[1,4]],
      ['Listing consistency checks','Compare product details, policies, and images for suspicious contradictions.',[2,3]],
      ['Uncertainty-aware warnings','Offer verification steps instead of treating sparse evidence as proof of fraud.',[4,5]],
      ['Merchant correction workflow','Let legitimate merchants submit evidence and appeal inaccurate signals.',[5,6]],
      ['Fraud-case review console','Combine reports and time-separated outcomes to refresh risk detection.',[7,8]],
    ],
    metrics:['Verified fraud avoided~Count independently confirmed harmful purchases prevented.','Trusted purchase completion~Measure successful purchases after users inspect risk evidence.','Merchant appeal accuracy~Track corrected false accusations and time to resolution.','Guardrail: false fraud flags~Measure legitimate sellers incorrectly warned against or suppressed.'],
  },
  mobileAssistant: {
    scope:'mobile conversational task assistance',
    users:[
      ['Hands-busy commuters','Typing is inconvenient~Users cannot safely enter a long task request while moving.','Noise corrupts intent~Speech input mishears important names or constraints.'],
      ['Interrupted mobile workers','Task progress disappears~A call or app switch loses a partially completed request.','Responses are too long~Users cannot inspect an answer on a small screen.'],
      ['Accessibility-focused users','Controls assume precise touch~Important actions are difficult with assistive input.','Conversation state unclear~Users cannot tell whether the assistant is listening or acting.'],
      ['Privacy-conscious organizers','Listening feels uncontrolled~Users cannot see when audio is captured or retained.','Actions happen without review~A message or event is changed without confirming the interpreted request.'],
    ],
    solutions:[
      ['Explicit push-to-talk','Start visible audio capture only when the user invokes it.',[1,7]],
      ['Intent confirmation card','Show recognized names and constraints before any external action.',[2,8]],
      ['Resumable task state','Restore the current job after interruptions without repeating completed actions.',[3,6]],
      ['Compact accessible responses','Use short cards with clear focus order and voice-compatible controls.',[4,5]],
      ['Action and recording controls','Expose listening status, approval, cancellation, and audio retention settings.',[6,7,8]],
    ],
    metrics:['Correct mobile tasks completed~Count intended tasks finished without human repair.','Interruption recovery~Measure sessions resumed successfully after an app or network interruption.','Time to useful result~Include voice correction and required action review.','Guardrail: unintended actions~Audit wrong-recipient, misheard, and unapproved changes.'],
  },
  searchAssistant: {
    scope:'six-month domain-specific conversational search',
    users:[
      ['Professional researchers','Search requires repeated reformulation~Users must translate a complex job into many separate queries.','Answer evidence is weak~A fluent synthesis cites pages that do not support its conclusion.'],
      ['Domain newcomers','Unknown terminology blocks discovery~Users cannot express the specialized terms needed to retrieve useful sources.','No clarification of ambiguity~The assistant answers the wrong interpretation of an underspecified question.'],
      ['Returning topic experts','New evidence is missed~Search returns familiar material instead of recent changes.','Source quality is mixed~Authoritative and unreliable pages are blended without explanation.'],
      ['Search platform operators','Serving costs escalate~Long answers and repeated retrieval make common requests expensive.','Access rights are unclear~The assistant exposes licensed or restricted source content incorrectly.'],
    ],
    solutions:[
      ['Task-aware query planning','Clarify the research job and generate scoped retrieval queries.',[1,3,4]],
      ['Claim-linked synthesis','Generate answers from retrieved passages with verifiable source links.',[2,6]],
      ['Freshness-aware retrieval','Prioritize current evidence while showing source dates and conflicts.',[5,6]],
      ['Evidence inspection view','Let users compare supporting passages and correct the question interpretation.',[2,4]],
      ['Budgeted permissioned retrieval','Limit retrieval and inference costs while respecting source access rights.',[7,8]],
    ],
    metrics:['Verified research task success~Measure answers that support a correct user conclusion.','Time to sourced conclusion~Include query iteration and evidence verification.','Retained research users~Count users returning for the same domain job.','Guardrail: unsupported citations~Audit citation entailment and restricted-content exposure.'],
  },
  assistantArchitecture: {
    scope:'permissioned generative-AI knowledge-and-action assistant',
    users:[
      ['Employee knowledge seekers','Answers lack current sources~Employees cannot verify whether guidance reflects approved documentation.','Restricted answers appear~Retrieved content crosses an employee’s permission boundary.'],
      ['Business workflow operators','Actions are ambiguous~Natural-language intent does not uniquely specify the required system change.','Partial failures duplicate work~An interrupted tool sequence repeats already completed changes.'],
      ['Application developers','Tool contracts are fragile~The model produces missing or invalid fields for business APIs.','Agent traces are opaque~Engineers cannot locate which retrieval or planning step failed.'],
      ['Security administrators','Model enforces its own policy~Authorization depends on model instructions instead of trusted services.','Access revocation is delayed~The assistant retains authority after a role or policy change.'],
    ],
    solutions:[
      ['Permission-aware retrieval','Apply current source permissions before retrieval and response rendering.',[1,2]],
      ['Typed action gateway','Validate tool schemas and enforce authorization in deterministic services.',[3,5,7]],
      ['Idempotent workflow state','Persist action identifiers and recover safely after partial failures.',[4,5]],
      ['End-to-end tracing','Connect source retrieval, model decisions, tools, and final outcomes in an auditable trace.',[6,4]],
      ['Revocable approval scopes','Use short-lived authority and explicit confirmation for consequential operations.',[7,8]],
    ],
    metrics:['Verified end-to-end tasks~Count intended knowledge or action jobs completed correctly.','Tool-action accuracy~Audit schema validity and business correctness of executed tool calls.','Cost and latency per task~Include retrieval, planning, tools, retries, and verification.','Guardrail: permission failures~Count unauthorized retrieval, stale authority, and duplicate writes.'],
  },
  chatAds: {
    scope:'hypothetical CPM-only ChatGPT advertising MVP',
    users:[
      ['Brand awareness advertisers','Exposure quality is unclear~Advertisers cannot tell whether a paid conversational impression was actually noticed.','No causal lift evidence~CPM spend does not show whether the campaign changed customer behavior.'],
      ['Performance marketing teams','CPM creates outcome uncertainty~Advertisers used to paying for clicks cannot predict acquisition efficiency.','Budget pacing is opaque~Campaigns spend unpredictably across conversational contexts.'],
      ['Assistant users','Sponsored content blurs advice~Users cannot tell whether payment influenced a factual answer.','Conversation privacy is unclear~People fear their sensitive requests are being exposed to advertisers.'],
      ['Brand safety reviewers','Unsafe adjacency threatens brands~Ads appear beside unsuitable or misleading generated content.','Creative controls are limited~A conversational placement misstates the advertiser’s offer.'],
    ],
    solutions:[
      ['Defined viewable impressions','Specify measurable eligible exposures and provide auditable campaign reporting.',[1,3]],
      ['Incrementality test package','Offer randomized holdouts and aggregate brand-lift reporting.',[2,3]],
      ['Budget and frequency controls','Let advertisers cap spend and repeated exposure by campaign.',[4,1]],
      ['Visible sponsorship boundary','Clearly label ads and keep payment separate from factual answer conclusions.',[5,6]],
      ['Approved context and creative','Limit categories and placement contexts with advertiser-reviewed claims.',[7,8]],
    ],
    metrics:['Incremental advertiser lift~Estimate campaign effects using eligible-user holdouts.','Viewable eligible impressions~Count exposures meeting an agreed audited definition.','Sustainable campaign renewal~Measure repeat advertiser demand at viable serving economics.','Guardrail: user trust loss~Track task success, misleading sponsorship, complaints, and privacy incidents.'],
  },
  smartFridge: {
    scope:'household food inventory and meal planning',
    users:[
      ['Busy family planners','Food expires unnoticed~Households forget ingredients before using them.','Shopping lists duplicate stock~Planners buy items already available at home.'],
      ['Budget-conscious cooks','Meal plans exceed budget~Recipe suggestions do not fit the household’s weekly spending limit.','Inventory correction is tedious~Scanning and correcting food items takes more work than a paper list.'],
      ['Shared household members','Stock changes are invisible~One person uses an ingredient without updating the household plan.','Preferences conflict~A suggested meal ignores another household member’s stated constraints.'],
      ['Privacy-conscious buyers','Cameras feel intrusive~Residents do not want continuous images of household activity.','Safety claims are unreliable~A picture cannot establish whether food remains safe to eat.'],
    ],
    solutions:[
      ['Use-soon meal suggestions','Suggest reviewable meals around user-confirmed items nearing their planned use date.',[1,3]],
      ['Editable shared inventory','Make stock corrections and household updates quick and visible.',[2,4,5]],
      ['Budget-aware meal-to-list','Build shopping lists from approved meals and confirmed existing stock.',[2,3,6]],
      ['Optional sensing controls','Keep recognition opt-in and explain image capture and retention.',[4,7]],
      ['Uncertainty and safety cues','Show uncertain inventory and avoid inferring food safety from appearance.',[6,8]],
    ],
    metrics:['Food used before waste~Measure household diary outcomes against the prior planning routine.','Weekly planning effort~Include inventory correction and list maintenance.','Retained household use~Track recurring shared meal and shopping planning.','Guardrail: incorrect inventory~Audit false stock assumptions and misleading safety suggestions.'],
  },
  memoryMachine: {
    scope:'hypothetical private multisensory memory experience',
    users:[
      ['Personal reminiscence users','Memories are hard to revisit~People cannot easily organize meaningful recorded moments across sensory formats.','Reconstruction feels authoritative~Generated details can be mistaken for an objective record.'],
      ['Family memory curators','Consent is fragmented~Memories contain people who did not agree to storage or sharing.','Sharing scope is unclear~A private memory can become visible to an unintended audience.'],
      ['Creative storytellers','Editing removes provenance~Creators cannot distinguish captured material from newly generated sensory elements.','Formats are inaccessible~A rich experience may exclude people with sensory or motor access needs.'],
      ['Privacy-sensitive subscribers','Deletion cannot be verified~Users cannot tell whether highly personal recordings were actually removed.','Unexpected emotional distress~A vivid reconstructed event can create an upsetting experience.'],
    ],
    solutions:[
      ['Private memory library','Organize user-selected moments with explicit visibility controls.',[1,4]],
      ['Generated-content provenance','Label captured and reconstructed elements and preserve edit history.',[2,5]],
      ['Participant consent controls','Limit sharing and provide a way to withdraw sensitive material.',[3,4]],
      ['Accessible sensory alternatives','Offer adjustable and alternative representations of the same memory.',[6,8]],
      ['Deletion and pause controls','Provide verifiable deletion and an immediate way to stop an upsetting experience.',[7,8]],
    ],
    metrics:['Meaningful voluntary revisits~Count sessions users identify as personally useful.','Retained private collections~Measure continued use after novelty fades.','Consent comprehension~Check users understand which people and formats are shared.','Guardrail: distress and privacy~Track unwanted exposure, failed deletion, and emotional harm reports.'],
  },
  beliefMachine: {
    scope:'hypothetical validated belief-reflection product',
    users:[
      ['Self-reflection adults','Inference lacks validity~Users cannot tell whether ranked beliefs reflect anything the system can actually measure.','Rankings imply certainty~A tentative model output looks like an objective account of the person.'],
      ['Private journal users','Sensitive beliefs exposed~Personal inferences may be shared beyond the intended private session.','Corrections are ignored~Users cannot challenge or revise an inaccurate interpretation.'],
      ['Independent validation researchers','Evaluation target is unclear~The team lacks an agreed external measure of the claimed capability.','Subjects misunderstand consent~Participants do not understand what the scan or inference may reveal.'],
      ['Vulnerable prospective users','Feedback causes distress~A persuasive interpretation undermines the user’s confidence or autonomy.','Third parties exploit rankings~An employer or advertiser uses inferred beliefs against the person.'],
    ],
    solutions:[
      ['Independent capability validation','Establish what can be inferred before designing commercial claims.',[1,5]],
      ['Uncertain editable reflections','Show hypotheses users can correct rather than definitive belief rankings.',[2,4]],
      ['Private user-owned storage','Keep sensitive results controlled by the data subject with deletion and export.',[3,8]],
      ['Explicit informed consent','Explain limitations and intended use before collecting sensitive data.',[5,6]],
      ['Restricted supervised pilot','Limit deployment and provide support and pause controls while assessing user impact.',[7,8]],
    ],
    metrics:['Validated inference quality~Measure the claimed signal against an independently defined reference.','User-understood benefit~Assess meaningful reflection without false certainty.','Correction and withdrawal success~Verify users can challenge results and remove data.','Guardrail: consequential misuse~Track distress and attempts to use rankings for discrimination or manipulation.'],
  },
  imageCreation: {
    scope:'ChatGPT image creation and conversational editing',
    users:[
      ['First-time image creators','Blank prompts discourage starts~Users cannot translate an intended image into a useful initial request.','First result misses intent~Generated output lacks the composition or content the user wanted.'],
      ['Small-business marketers','Edits alter unrelated elements~A requested change breaks branding or composition elsewhere in the image.','Text and layout imprecise~Users cannot reliably place readable text and objects.'],
      ['Iterative visual creators','Version history is confusing~Users cannot compare, restore, or build on an earlier useful version.','Generation and editing disconnected~Switching modes loses selected regions and existing constraints.'],
      ['Time-limited professional users','Too many retries required~A useful asset requires many costly failed generations.','Export does not fit use~The final image lacks the format or dimensions needed for its actual destination.'],
    ],
    solutions:[
      ['Editable task starters','Offer optional composition examples and a plain-language image brief.',[1,2]],
      ['Canvas-linked selection','Let users mark a region and describe a scoped change.',[3,4]],
      ['Locked visual constraints','Preserve approved elements, text, and layout across edits.',[3,6]],
      ['Version comparison and undo','Show image history with a reliable route back to an earlier result.',[5,7]],
      ['Destination-ready export','Preview dimensions and output format before final acceptance.',[8,7]],
    ],
    metrics:['Accepted useful images~Count images saved or exported for the intended real task.','Time to intended edit~Include all retries and human selection effort.','Retained creator workflows~Measure repeat use for image jobs after the first session.','Guardrail: unintended visual changes~Audit edits outside the selected scope and harmful output.'],
  },
  autonomousFleet: {
    scope:'self-driving fleet route-readiness evidence',
    users:[
      ['Fleet deployment managers','Route readiness uncertain~Managers cannot compare operational constraints across proposed service areas.','Evidence review takes too long~Expansion decisions require manually stitching together many fleet logs.'],
      ['Safety investigation teams','Edge cases hard to replay~A rare incident cannot be reconstructed from fragmented traces.','Simulation overstates confidence~Passing simulated cases is mistaken for proof of real-world safety.'],
      ['Local operations coordinators','Local restrictions are missed~Route plans ignore pickup rules, closures, or operational conditions.','Incidents lack ownership~Teams cannot assign a discovered issue to a responsible review owner.'],
      ['Fleet business owners','Expansion economics are unclear~Operational interruptions change the viable cost of serving a route.','Vendor conclusions opaque~A score does not expose the evidence behind a readiness recommendation.'],
    ],
    solutions:[
      ['Route evidence workspace','Aggregate permissioned route logs and operational constraints with provenance.',[1,2]],
      ['Incident replay toolkit','Reconstruct observed edge cases for expert review and follow-up.',[3,6]],
      ['Simulation limitation labels','Separate simulated findings from real-world validated evidence.',[4,8]],
      ['Local constraint review','Flag route rules and assign unresolved checks to qualified operators.',[5,6]],
      ['Operational economics view','Relate observed interruptions to route cost and service viability.',[7,8]],
    ],
    metrics:['Validated issues discovered~Count actionable problems confirmed by qualified fleet reviewers.','Route review time~Measure time to an evidence-backed deployment review.','Operational interruptions~Track verified interruptions after route changes.','Guardrail: false safety assurance~Audit recommendations that exceed the validated evidence.'],
  },
});
