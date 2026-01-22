import type { MathQuestionType, MathTopic } from "@math-wiz/db/schema/learning";

export interface MathPromptParams {
  topic: MathTopic;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  maxNumber: number;
  locale: string;
}

function getLanguageInstructions(locale: string): string {
  if (locale === "he") {
    return `
**CRITICAL: Generate ALL text content in Hebrew (עברית).**
- All questionText must be in Hebrew
- All hints must be in Hebrew
- Use Hebrew names for children (e.g., דני, מאיה, יוסי, נועה)
- Keep visual descriptions in English (for image generation)
- Use natural, child-friendly Hebrew appropriate for a 9-year-old`;
  }

  return `
**Generate ALL text content in English.**
- Use English names for children (e.g., Emma, Jack, Sophie, Tom)
- Keep language simple and clear for a 9-year-old`;
}

export function getMathQuestionDistribution(questionCount: number): {
  equation: number;
  multipleChoice: number;
  wordProblem: number;
} {
  const equationCount = Math.floor(questionCount / 3);
  const multipleChoiceCount = Math.floor(questionCount / 3);
  const wordProblemCount = questionCount - equationCount - multipleChoiceCount;

  return {
    equation: equationCount,
    multipleChoice: multipleChoiceCount,
    wordProblem: wordProblemCount,
  };
}

export function getMathPrompt(params: MathPromptParams): string {
  const { topic, difficulty, questionCount, maxNumber, locale } = params;
  const languageInstructions = getLanguageInstructions(locale);
  const distribution = getMathQuestionDistribution(questionCount);

  return `You are generating a set of ${questionCount} math questions for a 9-year-old child for a **playground app**.

${languageInstructions}

Requirements:
- Topic: ${topic} (e.g., addition, subtraction, multiplication, division)
- Difficulty: ${difficulty} (easy, medium, hard)
- Number of questions: ${questionCount}
- Each operand (number) in the math problem must be between 1 and ${maxNumber}
- **CRITICAL: Generate DIVERSE questions with DIFFERENT number combinations!**
  - Do NOT make all questions have the same answer
  - Use a wide variety of operands throughout the range (1 to ${maxNumber})
  - For example with maxNumber=20 and addition: use combinations like 7+5, 13+4, 9+8, 3+11 (varied operands, varied answers)
  - Avoid repetitive patterns like all sums equaling ${maxNumber}

**Question Type Distribution (mix it up, don't group by type):**
1. ${distribution.wordProblem} "word_problem" questions - Fun story problems (e.g., "Emma has 5 stickers. Her friend gives her 3 more. How many stickers does Emma have now?")
   - Set options to null
   - ALL word problems MUST have a visualDescription for drag-and-drop interaction

2. ${distribution.equation} "equation" questions - Simple math equations (e.g., "What is 7 + 4?", "Calculate: 12 - 5 = ?")
   - Set options to null
   - Set visualDescription to null

3. ${distribution.multipleChoice} "multiple_choice" questions - Questions with 4 answer options to choose from
   - Provide exactly 4 number options in the options array
   - One option MUST be the correctAnswer
   - Other options should be plausible wrong answers (close to correct answer)
   - Set visualDescription to null

**For ALL questions:**
- Each question must include 4 hints in this exact order:
  1. Thinking hint (encourages strategy)
  2. Visual hint (imagine or draw)
  3. Step hint (break it down)
  4. Full explanation
- Output should be **fun and age-appropriate**
- Make the questions engaging and encourage learning
- Keep language simple and clear for a 9-year-old

**For word problems with visuals:**
- Visual descriptions should be detailed enough to create an illustration (ALWAYS in English)
- Example: "5 red apples on the left and 3 green apples on the right"
- Use colorful, kid-friendly objects (apples, stars, balloons, toys, animals)

**Answer Format:**
- The correctAnswer must be an object with a "value" property containing the numeric answer
- Example: { "value": 42 }

Important: 
- Shuffle/mix the question types - don't put all of one type together`;
}

// Math-specific question types for Zod schema
export const mathQuestionTypes: readonly MathQuestionType[] = [
  "equation",
  "word_problem",
  "multiple_choice",
];
