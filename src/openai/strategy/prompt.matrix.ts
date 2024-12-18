export enum InputType {
  ULTRA_SHORT = "ultra_short", // 1-3 words
  SHORT = "short", // 4-20 words
  MEDIUM = "medium", // 21-100 words
  LONG = "long", // 101-500 words
  EXTENDED = "extended", // 500+ words
}

export enum InputComplexity {
  SIMPLE = "simple",
  MODERATE = "moderate",
  COMPLEX = "complex",
}

export interface TranscriptionStrategy {
  type: InputType;
  complexity: InputComplexity;
  prompt: string;
  maxTokens: number;
  temperature: number;
  correctionLevel: number;
}

export const TRANSCRIPTION_STRATEGIES: Record<
  InputType,
  TranscriptionStrategy
> = {
  [InputType.ULTRA_SHORT]: {
    type: InputType.ULTRA_SHORT,
    complexity: InputComplexity.SIMPLE,
    prompt: `ULTRA-SHORT TRANSCRIPTION PROTOCOL:
      - Add appropriate punctuation
      - Minimal correction
      - Maintain the original meaning and intent of the input
      - No external information
      OUTPUT:
        {
          "transcript": "[INPUT]",
        }`,
    maxTokens: 100,
    temperature: 0.1,
    correctionLevel: 0,
  },
  [InputType.SHORT]: {
    type: InputType.SHORT,
    complexity: InputComplexity.SIMPLE,
    prompt: `SHORT INPUT TRANSCRIPTION:  
        - Precise linguistic refinement  
        - Subtle grammatical corrections  
        - Preserve communication style  
        - Minimal intervention  
        - Translate non-dialogue text to English, retaining the original meaning  

      GUIDELINES:  
        - Correct basic spelling  
        - Maintain original tone  
        - No semantic alteration  
        - Dialogue or phrases in other languages should remain untranslated  

      OUTPUT:  
        {  
          "transcript": "[REFINED INPUT]",  
        }`,
    maxTokens: 200,
    temperature: 0.2,
    correctionLevel: 0.3,
  },
  [InputType.MEDIUM]: {
    type: InputType.MEDIUM,
    complexity: InputComplexity.MODERATE,
    prompt: `MEDIUM INPUT TRANSCRIPTION PROTOCOL:
      CORE PRINCIPLES:
      - Intelligent linguistic optimization
      - Contextual preservation
      - Nuanced grammatical refinement
      - Semantic integrity maintenance

      ADVANCED PROCESSING:
      - Correct structural inconsistencies
      - Preserve emotional undertones
      - Respect communication patterns
      - Minimal invasive corrections

      OUTPUT REQUIREMENTS:
        {
          "title": "[REFINED TEXT]",
          "transcript": "[INTELLIGENTLY REFINED TEXT]"
        }`,
    maxTokens: 300,
    temperature: 0.3,
    correctionLevel: 0.5,
  },
  [InputType.LONG]: {
    type: InputType.LONG,
    complexity: InputComplexity.MODERATE,
    prompt: `LONG INPUT TRANSCRIPTION PROTOCOL:

      TRANSCRIPTION GUIDELINES:
      - Convert all mixed-language (Hinglish) text into grammatically correct English.
      - Preserve the meaning and intent of the original input while ensuring linguistic clarity.
      - Correct basic grammatical errors, punctuation, and capitalization.
      - Do not translate proper nouns or unique terms that are part of names or places.
      - Maintain readability and flow without adding interpretations or inferred meanings.

      PROCESSING PRINCIPLES:
      1. Convert non-English phrases or words in Roman script (e.g., "vaaj ka din") to their English equivalents.
      2. Ensure the structure and flow of the output text are natural and fluent in English.
      3. Avoid adding information not present in the input.

      OUTPUT FORMAT:
        {
          "transcript": "[TEXT IN ENGLISH]"
        }`,
    maxTokens: 400,
    temperature: 0.3,
    correctionLevel: 0.6,
  },
  [InputType.EXTENDED]: {
    type: InputType.EXTENDED,
    complexity: InputComplexity.COMPLEX,
    prompt: `EXTENDED TRANSCRIPTION MASTER PROTOCOL:

      COMPREHENSIVE LINGUISTIC RECONSTRUCTION:
      - Highest fidelity processing
      - Forensic communication analysis
      - Semantic deep mapping
      - Comprehensive contextual preservation

      ULTRA-ADVANCED PROCESSING:
      - Maximum linguistic optimization
      - Complete contextual understanding
      - Granular communication style analysis
      - Precision-grade refinement

      **TASK**:
      - Refine the input text by correcting grammar, punctuation, and improving fluency, without providing factual answers or additional information. Ensure that the original meaning, tone, and intent are preserved.
      
      OUTPUT ARCHITECTURE:
        {
          "transcript": "[EXPERTLY RECONSTRUCTED TEXT]",
          "title": "[PROFESSIONALLY REFINED TITLE]",
        }
    `,
    maxTokens: 500,
    temperature: 0.5,
    correctionLevel: 0.9,
  },
};

export function classifyInput(input: string): TranscriptionStrategy {
  const wordCount = input.split(" ").length;

  if (wordCount <= 3) {
    return TRANSCRIPTION_STRATEGIES[InputType.ULTRA_SHORT];
  } else if (wordCount <= 20) {
    return TRANSCRIPTION_STRATEGIES[InputType.SHORT];
  } else if (wordCount <= 100) {
    return TRANSCRIPTION_STRATEGIES[InputType.MEDIUM];
  } else if (wordCount <= 500) {
    return TRANSCRIPTION_STRATEGIES[InputType.LONG];
  } else {
    return TRANSCRIPTION_STRATEGIES[InputType.EXTENDED];
  }
}
