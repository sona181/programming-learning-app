import type {
  ActivityType,
  LessonContext,
} from "@/lib/gemini/prompts/activities";

export type LessonMeta = Omit<LessonContext, "unitTitle" | "lessonTitle">;

type LessonMetaLookupInput = {
  language?: string | null;
  lessonTitle: string;
  pathTitle?: string | null;
  unitTitle?: string | null;
};

const defaultForbiddenConcepts = [
  "advanced language features",
  "frameworks",
  "third-party libraries",
  "object-oriented design",
  "recursion",
  "algorithms not named in the lesson",
];

export const defaultLessonMeta: LessonMeta = {
  language: "Python",
  learnerLevel: "beginner",
  goals: [
    "practice the current lesson idea",
    "recognize the main syntax pattern",
    "answer small beginner-level questions without using advanced concepts",
  ],
  allowedConcepts: ["basic syntax", "variables", "print", "simple expressions"],
  forbiddenConcepts: defaultForbiddenConcepts,
  preferredTypes: ["multiple_choice", "true_false", "fill_blank"],
  count: 4,
};

export const lessonMetaByKey: Record<string, LessonMeta> = {
  "java-beginner-path/welcome-to-java/what-is-java": {
    language: "Java",
    learnerLevel: "beginner",
    goals: [
      "understand that Java is a programming language",
      "recognize that Java programs run on many platforms",
      "identify the basic role of writing, compiling, and running Java code",
    ],
    allowedConcepts: [
      "Java as a programming language",
      "platform independence",
      "program source code",
      "compile",
      "run",
      "console output",
    ],
    forbiddenConcepts: [
      "variables",
      "loops",
      "methods",
      "classes beyond a simple mention",
      "objects",
      "inheritance",
      "arrays",
      "generics",
    ],
    preferredTypes: ["multiple_choice", "true_false", "fill_blank"],
    count: 4,
  },
  "python-basics/loops/for-loop-basics": {
    language: "Python",
    learnerLevel: "beginner",
    goals: [
      "understand what a for loop does",
      "use range() to repeat actions a fixed number of times",
      "predict the output of short for loop snippets",
    ],
    allowedConcepts: ["for", "range", "loop variable", "print", "integer counters"],
    forbiddenConcepts: [
      "while",
      "functions",
      "classes",
      "list comprehensions",
      "nested loops",
      "break",
      "continue",
    ],
    preferredTypes: ["multiple_choice", "fill_blank", "predict_output", "true_false"],
    count: 4,
  },
};

export function normalizeLessonMetaKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mergePreferredTypes(types: ActivityType[] | undefined): ActivityType[] {
  return types && types.length > 0 ? types : defaultLessonMeta.preferredTypes;
}

export function getLessonMeta(input: LessonMetaLookupInput): LessonMeta {
  const pathKey = input.pathTitle ? normalizeLessonMetaKey(input.pathTitle) : "";
  const unitKey = input.unitTitle ? normalizeLessonMetaKey(input.unitTitle) : "";
  const lessonKey = normalizeLessonMetaKey(input.lessonTitle);
  const compositeKey = [pathKey, unitKey, lessonKey].filter(Boolean).join("/");
  const configured = lessonMetaByKey[compositeKey] ?? lessonMetaByKey[lessonKey];
  const fallbackLanguage = input.language?.trim() || defaultLessonMeta.language;

  if (!configured) {
    return {
      ...defaultLessonMeta,
      language: fallbackLanguage,
      goals: [
        `practice ${input.lessonTitle}`,
        `answer beginner exercises about ${input.lessonTitle}`,
        "stay within the exact lesson topic",
      ],
      allowedConcepts: [input.lessonTitle, ...defaultLessonMeta.allowedConcepts],
    };
  }

  return {
    ...configured,
    language: configured.language || fallbackLanguage,
    preferredTypes: mergePreferredTypes(configured.preferredTypes),
  };
}
