import type { EnglishQuestionType, EnglishTopic } from "@math-wiz/db/schema/learning";

export interface EnglishPromptParams {
  topic: EnglishTopic;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  locale: string;
}

function getLanguageInstructions(locale: string): string {
  // English subject is primarily for English language learning
  // So we always generate in English, but can add native language hints
  if (locale === "he") {
    return `
**Generate questions in English (this is English language learning).**
- All questionText should be in English
- Hints can include Hebrew translations to help understanding
- Keep language appropriate for a 9-year-old learning English`;
  }

  return `
**Generate ALL text content in English.**
- Keep language simple and clear for a 9-year-old
- Use age-appropriate vocabulary`;
}

export function getEnglishQuestionDistribution(questionCount: number): {
  grammar: number;
  readingComprehension: number;
  spelling: number;
  sentenceCompletion: number;
} {
  const grammarCount = Math.floor(questionCount / 4);
  const readingComprehensionCount = Math.floor(questionCount / 4);
  const spellingCount = Math.floor(questionCount / 4);
  const sentenceCompletionCount =
    questionCount - grammarCount - readingComprehensionCount - spellingCount;

  return {
    grammar: grammarCount,
    readingComprehension: readingComprehensionCount,
    spelling: spellingCount,
    sentenceCompletion: sentenceCompletionCount,
  };
}

export function getEnglishPrompt(params: EnglishPromptParams): string {
  const { topic, difficulty, questionCount, locale } = params;
  const languageInstructions = getLanguageInstructions(locale);
  const distribution = getEnglishQuestionDistribution(questionCount);

  const topicDescriptions: Record<EnglishTopic, string> = {
    grammar: "parts of speech, sentence structure, verb tenses, subject-verb agreement",
    spelling: "commonly misspelled words, spelling patterns, phonics",
    reading_comprehension: "understanding short passages, finding main ideas, making inferences",
    vocabulary: "word meanings, synonyms, antonyms, context clues",
    punctuation: "periods, commas, question marks, exclamation points, apostrophes",
  };

  return `You are generating a set of ${questionCount} English language questions for a 9-year-old child for a **learning playground app**.

${languageInstructions}

Requirements:
- Topic: ${topic} - ${topicDescriptions[topic]}
- Difficulty: ${difficulty} (easy, medium, hard)
- Number of questions: ${questionCount}

**Question Type Distribution (mix it up, don't group by type):**

1. ${distribution.grammar} "grammar" questions - Questions about grammar rules and usage
   - Example: "Which word is the verb in this sentence: 'The dog runs fast'?"
   - correctAnswer should be: { "type": "choice", "value": "runs" }
   - Set options to an array of 4 string choices
   - Set visualDescription to null

2. ${distribution.readingComprehension} "reading_comprehension" questions - Questions about short passages
   - Include a short passage (2-4 sentences) in the questionText
   - Then ask a question about the passage
   - Example: "Read: 'Sarah loves to read books. She goes to the library every Saturday.' How often does Sarah go to the library?"
   - correctAnswer should be: { "type": "choice", "value": "Every Saturday" }
   - Set options to an array of 4 string choices
   - Set visualDescription to null

3. ${distribution.spelling} "spelling" questions - Questions about correct spelling
   - Example: "Which word is spelled correctly?"
   - correctAnswer should be: { "type": "choice", "value": "beautiful" }
   - Set options to an array of 4 string choices (one correct, three misspelled)
   - Set visualDescription to null

4. ${distribution.sentenceCompletion} "sentence_completion" questions - Fill in the blank questions
   - Example: "The cat sat ___ the mat."
   - correctAnswer should be: { "type": "text", "value": "on" }
   - Set options to an array of 4 string choices for possible answers
   - Set visualDescription to null

**IMPORTANT: For correctAnswer with type "choice", always use the exact text of the correct option, never a letter like A, B, C, D!**

**For ALL questions:**
- Each question must include 4 hints in this exact order:
  1. Thinking hint (encourages thinking about the rule)
  2. Example hint (gives a similar example)
  3. Clue hint (gives a helpful clue)
  4. Full explanation (explains the grammar/spelling rule)
- Output should be **fun and age-appropriate**
- Make the questions engaging and encourage language learning
- Keep language simple and clear for a 9-year-old
- Use words and sentences kids can relate to

**Difficulty Guidelines:**
- Easy: Simple sentences, common words, basic rules
- Medium: Compound sentences, less common words, intermediate rules
- Hard: Complex sentences, challenging vocabulary, advanced rules

Important:
- Shuffle/mix the question types - don't put all of one type together
- Ensure all answers are grammatically and spelling-wise correct`;
}

// English-specific question types for Zod schema
export const englishQuestionTypes: readonly EnglishQuestionType[] = [
  "grammar",
  "reading_comprehension",
  "spelling",
  "sentence_completion",
];
