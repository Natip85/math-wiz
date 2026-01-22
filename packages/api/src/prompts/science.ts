import type { ScienceQuestionType, ScienceTopic } from "@math-wiz/db/schema/learning";

export interface SciencePromptParams {
  topic: ScienceTopic;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  locale: string;
}

function getLanguageInstructions(locale: string): string {
  if (locale === "he") {
    return `
**CRITICAL: Generate ALL text content in Hebrew (עברית).**
- All questionText must be in Hebrew
- All hints must be in Hebrew
- Keep visual descriptions in English (for image generation)
- Use natural, child-friendly Hebrew appropriate for a 9-year-old`;
  }

  return `
**Generate ALL text content in English.**
- Keep language simple and clear for a 9-year-old`;
}

export function getScienceQuestionDistribution(questionCount: number): {
  fact: number;
  experiment: number;
  diagramLabel: number;
  multipleChoice: number;
} {
  const factCount = Math.floor(questionCount / 4);
  const experimentCount = Math.floor(questionCount / 4);
  const diagramLabelCount = Math.floor(questionCount / 4);
  const multipleChoiceCount = questionCount - factCount - experimentCount - diagramLabelCount;

  return {
    fact: factCount,
    experiment: experimentCount,
    diagramLabel: diagramLabelCount,
    multipleChoice: multipleChoiceCount,
  };
}

export function getSciencePrompt(params: SciencePromptParams): string {
  const { topic, difficulty, questionCount, locale } = params;
  const languageInstructions = getLanguageInstructions(locale);
  const distribution = getScienceQuestionDistribution(questionCount);

  const topicDescriptions: Record<ScienceTopic, string> = {
    plants: "plant life, photosynthesis, parts of plants, how plants grow",
    animals: "animal habitats, animal classification, animal behaviors, life cycles",
    forces: "push and pull, gravity, friction, simple machines",
    matter: "states of matter (solid, liquid, gas), properties of materials",
    weather: "weather patterns, seasons, water cycle, clouds",
    solar_system: "planets, sun, moon, stars, day and night",
  };

  return `You are generating a set of ${questionCount} science questions for a 9-year-old child for a **learning playground app**.

${languageInstructions}

Requirements:
- Topic: ${topic} - ${topicDescriptions[topic]}
- Difficulty: ${difficulty} (easy, medium, hard)
- Number of questions: ${questionCount}

**Question Type Distribution (mix it up, don't group by type):**

1. ${distribution.fact} "fact" questions - ONLY for simple true/false statements
   - type: "fact"
   - Example question: "Plants need sunlight to make food. True or false?"
   - correctAnswer MUST be: { "type": "boolean", "value": true } or { "type": "boolean", "value": false }
   - Set options to null
   - Set visualDescription to null

2. ${distribution.experiment} "experiment" questions - Questions asking "what happens if..." or "what would you observe..."
   - type: "experiment"
   - Example question: "What do you think will happen if you put a plant in a dark room for a week?"
   - correctAnswer MUST be: { "type": "explanation", "value": "The plant will become weak and pale because it cannot make food without sunlight", "keywords": ["weak", "pale", "sunlight", "food"] }
   - NEVER use boolean for experiment questions! They require text explanations.
   - Set options to null
   - Can include visualDescription for experiment setup

3. ${distribution.diagramLabel} "diagram_label" questions - Questions about labeling parts of diagrams
   - type: "diagram_label"
   - Example question: "Which part of the plant absorbs water from the soil?"
   - correctAnswer MUST be: { "type": "choice", "value": "Roots" } - use the ACTUAL correct option text
   - Set options to an array of 4 string choices
   - Should include visualDescription for the diagram

4. ${distribution.multipleChoice} "multiple_choice" questions - Standard multiple choice questions
   - type: "multiple_choice"
   - Example question: "What state of matter is ice?"
   - correctAnswer MUST be: { "type": "choice", "value": "Solid" } - use the ACTUAL correct option text
   - Set options to an array of 4 string choices (the actual answer options, not letters)
   - Set visualDescription to null unless helpful

**CRITICAL RULES - READ CAREFULLY:**
- "fact" questions → correctAnswer.type MUST be "boolean"
- "experiment" questions → correctAnswer.type MUST be "explanation" (NEVER boolean!)
- "diagram_label" questions → correctAnswer.type MUST be "choice"
- "multiple_choice" questions → correctAnswer.type MUST be "choice"
- For "choice" type, use the exact text of the correct option, NEVER a letter like A, B, C, D!

**For ALL questions:**
- Each question must include 4 hints in this exact order:
  1. Thinking hint (encourages scientific thinking)
  2. Connection hint (relate to everyday life)
  3. Clue hint (gives a helpful clue)
  4. Full explanation (explains the science)
- Output should be **fun and age-appropriate**
- Make the questions engaging and encourage curiosity
- Keep language simple and clear for a 9-year-old
- Use real-world examples kids can relate to

**For questions with visuals:**
- Visual descriptions should be detailed enough to create an illustration (ALWAYS in English)
- Example: "A simple diagram of a plant showing roots, stem, leaves, and flower"
- Use colorful, kid-friendly illustrations

Important:
- Shuffle/mix the question types - don't put all of one type together
- Make sure answers are scientifically accurate but age-appropriate`;
}

// Science-specific question types for Zod schema
export const scienceQuestionTypes: readonly ScienceQuestionType[] = [
  "fact",
  "experiment",
  "diagram_label",
  "multiple_choice",
];
