# SpeakBack AI — Product Requirements Document

## 1. Product Overview

**Product Name:** SpeakBack AI  
**Tagline:** Understand tutorials. Take action. Learn by speaking.  
**Product Type:** AI-powered, voice-first learning copilot  
**Primary Audience:** Beginner developers and students  
**Hackathon Track:** Open Track, designed to build meaningfully around Wispr Flow and AIGI  
**Platform:** Responsive web application

### Product Vision

SpeakBack AI helps beginner developers understand technical tutorials and turn that understanding into practical action.

Users can provide a tutorial transcript, choose their preferred language, receive a simple explanation, follow step-by-step instructions, ask follow-up questions using voice input, and test their understanding with short practice questions.

The product should do more than summarize content. It should help users move from watching a tutorial to applying what they learned.

## 2. Problem Statement

Beginners frequently struggle with technical tutorials because:

- Explanations use unfamiliar technical terminology.
- Tutorials move too quickly or skip important steps.
- Beginners do not know what to do after understanding a concept.
- Searching for answers interrupts the learning process.
- Language barriers make technical learning harder.
- Generic summaries do not confirm whether users actually understand the material.

SpeakBack AI addresses these problems through source-grounded explanations, actionable learning steps, multilingual support, and voice-first interaction.

## 3. Target Users

### Primary User

A beginner developer learning JavaScript, Node.js, APIs, Git, or other programming concepts.

### Secondary Users

- Students learning technical subjects.
- Self-taught developers following online tutorials.
- Users who prefer explanations in Hindi, Punjabi, or simple English.

## 4. Core User Journey

1. The user opens SpeakBack AI.
2. The user pastes a tutorial transcript into the input area.
3. The user selects a preferred explanation language:
   - English
   - Hindi
   - Punjabi
4. The user clicks "Explain My Tutorial".
5. The application generates:
   - A short summary.
   - A beginner-friendly explanation.
   - Important concepts and definitions.
   - Step-by-step actions.
   - Common mistakes or troubleshooting guidance, where relevant.
   - Practice questions.
6. The user asks a follow-up question by typing or using available voice input.
7. The application answers using the provided tutorial context whenever possible.
8. The user completes a short quiz to check their understanding.

## 5. Product Goals

### Primary Goals

- Convert technical tutorial content into understandable explanations.
- Help users identify practical next steps.
- Support multilingual learning.
- Enable natural voice-based follow-up questions.
- Ground answers in available source material.
- Deliver a reliable, demonstrable end-to-end MVP.

### Success Criteria

The MVP should allow a judge to:

1. Submit a sample tutorial transcript.
2. Generate an explanation in a selected language.
3. View actionable steps.
4. Ask a follow-up question.
5. Receive a contextual response.
6. Complete a short practice quiz.

The complete demonstration should work without requiring the judge to configure API credentials or install software.

## 6. Core Features

### Feature 1: Tutorial Input

**Priority:** P0 — Must Have

Allow users to paste tutorial transcripts into a text area.

Requirements:
- Show a clear input label and example.
- Validate empty input.
- Display a useful error message for invalid input.
- Support a practical maximum input length.
- Show a loading state while processing.
- Provide a sample tutorial so users can try the application immediately.

For the hackathon MVP, transcript input is the reliable default.

Direct video URL processing and automatic transcription are optional extensions. Do not make the application depend on them.

### Feature 2: AI Tutorial Explanation

**Priority:** P0 — Must Have

Generate a structured explanation based on the supplied transcript.

Output sections:
1. What this tutorial teaches.
2. Beginner-friendly explanation.
3. Important concepts.
4. Step-by-step actions.
5. Common mistakes, when relevant.
6. What the learner should understand before moving forward.

Requirements:
- Use simple language.
- Explain technical terms when first introduced.
- Prefer short paragraphs and numbered instructions.
- Avoid unnecessary complexity.
- Clearly distinguish source-supported information from additional general guidance.
- If the transcript does not contain enough information, explain the limitation instead of inventing details.

### Feature 3: Multilingual Explanations

**Priority:** P0 — Must Have

Allow users to select English, Hindi, or Punjabi.

Requirements:
- Generate the explanation in the selected language.
- Preserve programming keywords, commands, filenames, and code syntax.
- Keep technical instructions accurate during translation.
- Avoid translating code identifiers into natural-language words.
- Allow the user to change the language for follow-up explanations.

### Feature 4: Actionable Learning Checklist

**Priority:** P0 — Must Have

Convert the tutorial into a practical checklist.

Example:

- [ ] Open the project folder.
- [ ] Install the required dependencies.
- [ ] Create the server file.
- [ ] Start the development server.
- [ ] Verify the expected response.

Requirements:
- Steps must be based on the provided tutorial or clearly identified as additional guidance.
- Users can mark steps as complete.
- Completed steps should have a visible state.
- Keep instructions specific and concise.
- Do not claim a command has been executed or verified unless the application actually executed it.

### Feature 5: Voice-First Questions

**Priority:** P1 — High

Allow users to ask follow-up questions through voice input when a supported voice-input method is available.

Example questions:
- "Explain this in simple Hindi."
- "What does this command do?"
- "What should I do next?"
- "Why might this error occur?"
- "Give me another example."

Requirements:
- Provide a clear microphone control.
- Indicate when voice input is listening or processing.
- Show the recognized text before submission when practical.
- Allow users to correct recognized text.
- Provide a text-input fallback.
- Handle microphone permission failures gracefully.

#### Wispr Flow Integration

Wispr Flow should be incorporated meaningfully into the voice-first workflow if the sponsor's available product and integration rules support it.

Possible implementation:
- Demonstrate how a user can dictate questions into SpeakBack AI using Wispr Flow.
- Document the actual integration or workflow used.
- Clearly distinguish native integration from external dictation.

Do not claim a native SDK, API, or direct integration unless it has been implemented and verified.

The product must remain usable if Wispr Flow is unavailable during the demo.

### Feature 6: Contextual Follow-Up Chat

**Priority:** P0 — Must Have

Provide a question-and-answer interface tied to the submitted tutorial.

Requirements:
- Keep the current tutorial context available during the session.
- Answer the user's question in the selected language.
- Refer to relevant tutorial passages when available.
- Ask for clarification when a question is ambiguous.
- Explain when an answer is not supported by the provided transcript.
- Provide a text-based fallback for voice interaction.

The assistant should prioritize helping the user understand and apply the tutorial, not simply generating long answers.

### Feature 7: Practice Quiz

**Priority:** P1 — High

Generate a small quiz from the tutorial.

Requirements:
- Generate approximately three to five questions.
- Prefer multiple-choice questions for the MVP.
- Show the correct answer and a short explanation after submission.
- Focus on understanding rather than memorization.
- Avoid questions that require information absent from the tutorial unless clearly marked as additional knowledge.

### Feature 8: Source References

**Priority:** P1 — High

Connect explanations to the available source material.

Requirements:
- Use actual transcript passages when available.
- Include timestamps only when reliable timestamps exist in the source.
- Never fabricate timestamps.
- Do not imply that an external video was processed when only a pasted transcript was provided.
- When timestamps are unavailable, show relevant source excerpts instead.

## 7. AI Provider and AIGI Requirements

**Priority:** P0 for a working AI response; exact sponsor integration depends on confirmed access.

Use an available AI model or inference service to generate tutorial explanations, checklists, follow-up answers, and quizzes.

AIGI should be incorporated using the resources, models, credits, or integration methods actually available to the participant.

Requirements:
- Keep API keys on the server.
- Read secrets from environment variables.
- Never expose secret keys in browser code or public repositories.
- Display a useful error if the AI service fails.
- Avoid sending the same request repeatedly when a request is already processing.
- Provide a clear loading state.
- Validate AI output before rendering it.
- Do not render generated HTML as trusted application markup.
- Provide a sample or fallback demonstration if permitted and necessary.

Do not assume a specific AIGI API, model, endpoint, or SDK until access and documentation have been verified.

## 8. User Interface Requirements

Create a clean, modern, responsive interface suitable for a live hackathon demonstration.

### Main Screen

Include:
- SpeakBack AI logo or wordmark.
- A short value proposition.
- Tutorial transcript input.
- Language selector.
- "Explain My Tutorial" button.
- Sample tutorial option.
- Voice-input control, if available.
- Clear loading and error states.

### Results Screen

Display:
- Tutorial summary.
- Beginner-friendly explanation.
- Action checklist.
- Important concepts.
- Follow-up question interface.
- Practice quiz.
- Source references when available.

### Design Principles

- Simple, polished, professional visual design.
- Clear visual hierarchy.
- Readable typography.
- Responsive layout for desktop and mobile.
- Accessible labels and controls.
- No unnecessary dashboards or complex navigation.
- Keep the primary workflow visible and easy to understand.

## 9. Technical Requirements

The implementation should use a stack that can be built and maintained reliably within the hackathon timeframe.

Preferred approach:
- Next.js or another familiar React-based web framework.
- Server-side API routes for AI requests.
- A supported AI inference provider available through AIGI, if appropriate.
- Browser-supported voice input or a verified voice workflow.
- Responsive CSS and reusable UI components.

These are implementation preferences, not mandatory requirements. Choose the simplest working stack supported by the development environment.

### Architecture

User Interface
    |
    v
Tutorial Input and Language Selection
    |
    v
Server-Side API
    |
    v
Available AI Model / Inference Provider
    |
    v
Validated Structured Response
    |
    v
Explanation + Checklist + Follow-Up Chat + Quiz

Voice input should feed into the same question workflow rather than creating a separate, duplicated AI pipeline.

## 10. Data and Privacy

The MVP should minimize personal data collection.

Requirements:
- Do not require account creation unless necessary.
- Do not store tutorial transcripts by default.
- Do not log API keys or sensitive user content.
- Explain when content is sent to an external AI provider.
- Request microphone permission only when voice input is activated.
- Do not record or retain audio without a clear need and appropriate user consent.
- Do not claim that data is never stored by third-party providers unless their actual policies confirm this.

## 11. Error Handling

The application should handle:
- Empty transcript input.
- Excessively long input.
- AI provider errors.
- API rate limits.
- Network failures.
- Invalid or incomplete model responses.
- Microphone permission denial.
- Unsupported browser voice features.
- Missing timestamps or source references.

Error messages should be understandable to beginners and provide a practical next step.

## 12. MVP Scope

### Must Have — P0

- Responsive application.
- Transcript input.
- Language selection.
- AI-generated tutorial explanation.
- Actionable checklist.
- Contextual follow-up questions.
- Loading and error states.
- Reliable sample demonstration.
- Secure server-side AI calls.

### Should Have — P1

- Voice input or a verified Wispr Flow workflow.
- Practice quiz.
- Source excerpts or reliable timestamps.
- Strong Hindi and Punjabi experience.
- Polished demo-ready interface.

### Stretch Goals — P2

- Automatic transcription from uploaded audio or video.
- Supported video URL ingestion.
- Live screen or video understanding.
- Text-to-speech responses.
- Saved learning sessions.
- User accounts and progress history.

Do not start stretch goals until the core user journey works end to end.

## 13. Explicitly Out of Scope

For the hackathon MVP, do not prioritize:
- Building a complete learning management system.
- Complex user authentication.
- Social features.
- A large course marketplace.
- Multiple autonomous agents without a clear need.
- Blockchain functionality without a specific user benefit or confirmed track requirement.
- Live screen capture before the core learning workflow is stable.

## 14. Demo Scenario

The demo should use a short, realistic programming tutorial about starting an Express.js server.

Demo flow:

1. Open SpeakBack AI.
2. Load a prepared Express.js tutorial transcript.
3. Select Hindi.
4. Generate the explanation.
5. Show the simple explanation and practical checklist.
6. Ask: "Server ko run karne ke liye mujhe kya karna hai?"
7. Show a contextual answer.
8. Complete one quiz question.
9. Demonstrate the actual Wispr Flow voice workflow if available.

The demo must not depend on an unreliable live video transcription pipeline.

Any sample data or fallback response must be clearly distinguished from a live AI-generated result.

## 15. Acceptance Criteria

The MVP is ready for judging when:

- [ ] The application starts successfully.
- [ ] The main page works on desktop and mobile.
- [ ] Users can submit a valid transcript.
- [ ] Empty input produces a useful validation message.
- [ ] A structured explanation is generated successfully.
- [ ] The language selector changes the response language.
- [ ] The checklist displays actionable steps.
- [ ] Follow-up questions use the current tutorial context.
- [ ] The quiz displays questions and feedback.
- [ ] Voice input works if included, with a text fallback.
- [ ] Source references are accurate whenever shown.
- [ ] Missing timestamps are never fabricated.
- [ ] AI failures produce understandable error messages.
- [ ] API secrets are not exposed in frontend code.
- [ ] The demo can be completed without unexpected setup.
- [ ] Sponsor-related claims accurately describe the integrations actually demonstrated.

## 16. Hackathon Build Strategy

Build in this order:

### Phase 1 — Core Workflow
- Create the application shell.
- Implement transcript input.
- Add language selection.
- Connect the available AI provider.
- Render the structured explanation.

### Phase 2 — Practical Learning
- Add the checklist.
- Add contextual follow-up questions.
- Add the practice quiz.

### Phase 3 — Sponsor Alignment
- Verify available Wispr Flow capabilities and the actual integration method.
- Verify available AIGI resources and inference access.
- Implement and test the sponsor-related workflow.
- Avoid unsupported integration claims.

### Phase 4 — Reliability and Demo
- Test valid and invalid inputs.
- Test provider failures.
- Verify language output.
- Test the complete demo flow.
- Fix critical UI issues.
- Prepare a short demonstration and explanation of the problem, solution, and sponsor usage.

## 17. Product Differentiation

SpeakBack AI should not present itself as merely another summarization tool.

Its differentiation is the complete learning loop:

**Understand → Take Action → Ask by Voice → Practice → Verify Understanding**

The product should demonstrate how a beginner moves from passive tutorial consumption to practical understanding.

## 18. Final Product Principle

Reliability is more important than feature count.

Build a small, functional product that demonstrates real user value. Integrate Wispr Flow and AIGI only through verified capabilities, and make every sponsor-related feature meaningful to the learning experience.
