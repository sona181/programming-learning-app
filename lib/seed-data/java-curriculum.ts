export type JavaActivityType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "predict_output"
  | "reorder_tokens"
  | "trace_code";

export type JavaQuizQuestionType = "multiple_choice" | "true_false";

export type JavaActivityOptions = {
  acceptedAnswers?: string[];
  choices?: string[];
  code?: string;
  explanation?: string;
  starter?: string;
  tokens?: string[];
};

export type JavaCurriculumActivity = {
  activityType: JavaActivityType;
  correctAnswer: string;
  options?: JavaActivityOptions;
  prompt: string;
  xpReward: number;
};

export type JavaCurriculumQuizOption = {
  body: string;
  isCorrect: boolean;
};

export type JavaCurriculumQuizQuestion = {
  body: string;
  options: JavaCurriculumQuizOption[];
  points: number;
  questionType: JavaQuizQuestionType;
};

export type JavaCurriculumLesson = {
  content: {
    example: string;
    summary: string;
    text: string;
    tip: string;
  };
  durationSeconds: number;
  isFreePreview: boolean;
  key: string;
  path: {
    activities: JavaCurriculumActivity[];
    xpReward: number;
  };
  title: string;
};

export type JavaCurriculumUnit = {
  checkpoint: {
    passScore: number;
    questions: JavaCurriculumQuizQuestion[];
    timeLimitSeconds: number | null;
    title: string;
  };
  description: string;
  key: string;
  lessons: JavaCurriculumLesson[];
  title: string;
};

function lesson(
  key: string,
  title: string,
  content: JavaCurriculumLesson["content"],
  activities: JavaCurriculumActivity[],
  config: {
    durationSeconds?: number;
    isFreePreview?: boolean;
    xpReward?: number;
  } = {},
): JavaCurriculumLesson {
  return {
    content,
    durationSeconds: config.durationSeconds ?? 360,
    isFreePreview: config.isFreePreview ?? false,
    key,
    path: {
      activities,
      xpReward: config.xpReward ?? 20,
    },
    title,
  };
}

function unit(
  key: string,
  title: string,
  description: string,
  lessons: JavaCurriculumLesson[],
  checkpoint: JavaCurriculumUnit["checkpoint"],
): JavaCurriculumUnit {
  return {
    checkpoint,
    description,
    key,
    lessons,
    title,
  };
}

function mc(
  prompt: string,
  correctAnswer: string,
  choices: string[],
  explanation: string,
  xpReward = 5,
): JavaCurriculumActivity {
  return {
    activityType: "multiple_choice",
    correctAnswer,
    options: {
      choices,
      explanation,
    },
    prompt,
    xpReward,
  };
}

function tf(
  prompt: string,
  correctAnswer: "true" | "false",
  explanation: string,
  xpReward = 5,
): JavaCurriculumActivity {
  return {
    activityType: "true_false",
    correctAnswer,
    options: {
      choices: ["true", "false"],
      explanation,
    },
    prompt,
    xpReward,
  };
}

function blank(
  prompt: string,
  correctAnswer: string,
  config: {
    acceptedAnswers?: string[];
    explanation: string;
    starter?: string;
    xpReward?: number;
  },
): JavaCurriculumActivity {
  return {
    activityType: "fill_blank",
    correctAnswer,
    options: {
      acceptedAnswers: config.acceptedAnswers,
      explanation: config.explanation,
      starter: config.starter,
    },
    prompt,
    xpReward: config.xpReward ?? 5,
  };
}

function predict(
  prompt: string,
  correctAnswer: string,
  config: {
    acceptedAnswers?: string[];
    code: string;
    explanation: string;
    xpReward?: number;
  },
): JavaCurriculumActivity {
  return {
    activityType: "predict_output",
    correctAnswer,
    options: {
      acceptedAnswers: config.acceptedAnswers,
      code: config.code,
      explanation: config.explanation,
    },
    prompt,
    xpReward: config.xpReward ?? 5,
  };
}

function reorder(
  prompt: string,
  correctAnswer: string,
  tokens: string[],
  explanation: string,
  xpReward = 5,
): JavaCurriculumActivity {
  return {
    activityType: "reorder_tokens",
    correctAnswer,
    options: {
      explanation,
      tokens,
    },
    prompt,
    xpReward,
  };
}

function trace(
  prompt: string,
  correctAnswer: string,
  config: {
    acceptedAnswers?: string[];
    code: string;
    explanation: string;
    xpReward?: number;
  },
): JavaCurriculumActivity {
  return {
    activityType: "trace_code",
    correctAnswer,
    options: {
      acceptedAnswers: config.acceptedAnswers,
      code: config.code,
      explanation: config.explanation,
    },
    prompt,
    xpReward: config.xpReward ?? 5,
  };
}

function quizMc(
  body: string,
  correctAnswer: string,
  distractors: string[],
  points = 1,
): JavaCurriculumQuizQuestion {
  return {
    body,
    options: [
      { body: correctAnswer, isCorrect: true },
      ...distractors.map((option) => ({
        body: option,
        isCorrect: false,
      })),
    ],
    points,
    questionType: "multiple_choice",
  };
}

function quizTf(
  body: string,
  correctAnswer: boolean,
  points = 1,
): JavaCurriculumQuizQuestion {
  return {
    body,
    options: [
      { body: "True", isCorrect: correctAnswer },
      { body: "False", isCorrect: !correctAnswer },
    ],
    points,
    questionType: "true_false",
  };
}

export const javaCurriculumSeed = {
  author: {
    displayName: "UniLearn Java Team",
    email: "content.seed+java@unilearn.local",
    key: "java-seed-author",
    passwordHash:
      "$2b$10$9CnB2Bnz9vvR/vDV5YjQjOc72L0KDtqr9N/.BGXXMUotF/Aa0eDem",
    role: "instructor",
  },
  course: {
    description:
      "A complete beginner Java course with short explanations, practical examples, checkpoint quizzes, and a guided path through the full first-year workflow.",
    isPremium: false,
    key: "java-foundations-course",
    language: "en",
    level: "beginner",
    slug: "java-foundations",
    status: "published",
    title: "Java Foundations",
  },
  path: {
    description:
      "A full 12-unit Java beginner path with guided lessons, short practice steps, and checkpoint quizzes from first print statements to a final mini project.",
    estimatedDays: 42,
    key: "java-beginner-path",
    language: "en",
    level: "beginner",
    slug: "java-beginner-path",
    status: "published",
    title: "Java Beginner Path",
  },
  units: [
    unit(
      "welcome-to-java",
      "Welcome to Java",
      "Meet Java, understand the first program structure, print output, and run a simple program.",
      [
        lesson(
          "welcome-what-is-java",
          "What is Java?",
          {
            text: "Java is a programming language used in classrooms, apps, backend systems, and Android development. Beginners like Java because it teaches structure clearly and can run on many platforms.",
            example: "You write Java code in files like Main.java, compile it, and then run the compiled program on a Java Virtual Machine.",
            tip: "Think of Java as a language plus a toolkit. The JDK helps you write and compile code, and the JVM runs the compiled result.",
            summary: "Java is a portable programming language used to build many kinds of software.",
          },
          [
            mc(
              "Which description fits Java best?",
              "A programming language that can run on many platforms",
              [
                "A file storage app",
                "A programming language that can run on many platforms",
                "A spreadsheet formula",
                "A web browser setting",
              ],
              "Java programs are compiled and can run anywhere a Java Virtual Machine is available.",
            ),
            tf(
              "Java can be used for apps, backend systems, and beginner classroom projects.",
              "true",
              "Java is used in many contexts, not just one type of program.",
            ),
            blank(
              "Complete the sentence: Java is a ___ language.",
              "programming",
              {
                acceptedAnswers: ["programming"],
                explanation: "Java is a programming language, not a device or command.",
                starter: "Java is a ___ language.",
              },
            ),
          ],
          { durationSeconds: 300, isFreePreview: true, xpReward: 15 },
        ),
        lesson(
          "welcome-first-main-method",
          "Your first main method",
          {
            text: "A beginner Java program starts inside a class, and the main method is the entry point. When Java runs your program, it begins with the code inside main.",
            example: "public class Main {\n  public static void main(String[] args) {\n    // program starts here\n  }\n}",
            tip: "The main method line looks long at first. Most beginners simply memorize it and place instructions inside its braces.",
            summary: "Java starts in a class, and execution begins inside main.",
          },
          [
            reorder(
              "Put the method keywords in the correct order for the Java entry point.",
              "public static void main",
              ["main", "public", "void", "static"],
              "The main method starts with public static void main before the parameter list.",
            ),
            mc(
              "Where does a beginner Java program begin running?",
              "Inside the main method",
              [
                "At the top of the file name",
                "Inside the main method",
                "Inside the first comment",
                "Inside the import list",
              ],
              "Java begins executing a beginner program in main.",
            ),
            trace(
              "How many opening braces appear in this code?",
              "2",
              {
                code: "public class Main {\n  public static void main(String[] args) {\n  }\n}",
                explanation: "One opening brace starts the class and one starts the main method.",
              },
            ),
          ],
          { durationSeconds: 360, isFreePreview: true },
        ),
        lesson(
          "welcome-printing-with-println",
          "Printing with System.out.println",
          {
            text: "System.out.println sends a line of text to the console. It is one of the first tools beginners use to check whether a Java program is working.",
            example: "System.out.println(\"Hello, Java!\");",
            tip: "Text goes inside double quotes. Without quotes, Java treats the value like a name or variable.",
            summary: "Use System.out.println when you want Java to display a line in the console.",
          },
          [
            blank(
              "Complete the Java print statement.",
              "System.out.println",
              {
                acceptedAnswers: ["System.out.println"],
                explanation: "System.out.println prints one line to the console.",
                starter: "___(\"Hello\");",
              },
            ),
            predict(
              "What does this code print?",
              "Hello, Java!",
              {
                acceptedAnswers: ["Hello, Java!"],
                code: "System.out.println(\"Hello, Java!\");",
                explanation: "The text inside the quotes is printed exactly as written.",
              },
            ),
            mc(
              "Which line correctly prints your name?",
              "System.out.println(\"Ava\");",
              [
                "System.out.println(\"Ava\");",
                "println Ava;",
                "int Ava = println;",
                "System.out.printLine(Ava);",
              ],
              "The correct beginner pattern is System.out.println with quoted text.",
              10,
            ),
          ],
          { durationSeconds: 300, isFreePreview: true },
        ),
        lesson(
          "welcome-running-a-simple-program",
          "Running a simple Java program",
          {
            text: "After writing your program, you save it, compile it, and run it. Some beginner tools hide these steps, but the idea is still the same: Java needs to turn source code into something runnable.",
            example: "Write Main.java, compile it, and run the Main class to see the console output.",
            tip: "Even if your editor uses a Run button, it is still doing the same job underneath: compile first, then run.",
            summary: "A simple Java workflow is write, compile, run, and check the output.",
          },
          [
            mc(
              "What happens after you write a Java program?",
              "You compile it and then run it",
              [
                "You compile it and then run it",
                "You upload it as a video",
                "You sort it like a spreadsheet",
                "You rename the keyboard",
              ],
              "Java source code is compiled first, then the compiled result is run.",
            ),
            tf(
              "A Java program can only be useful after it is run and its output is checked.",
              "true",
              "Running the program lets you see whether the instructions actually work.",
            ),
            predict(
              "If this program is run, what appears in the console?",
              "Biology",
              {
                acceptedAnswers: ["Biology"],
                code: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Biology\");\n  }\n}",
                explanation: "Running the program prints the exact string inside println.",
              },
            ),
          ],
          { durationSeconds: 300 },
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "What is Java?",
            "A programming language",
            ["A calculator brand", "A computer monitor", "A file upload format"],
          ),
          quizMc(
            "Which method is the entry point of a beginner Java program?",
            "main()",
            ["print()", "start()", "runJava()"],
          ),
          quizTf("A Java program begins inside a class.", true),
          quizMc(
            "Which line prints text to the console?",
            "System.out.println(\"Ava\");",
            ["int System = \"Ava\";", "println Ava;", "Main.output(\"Ava\");"],
          ),
          quizMc(
            "Which checkpoint goal best matches Unit 1?",
            "Write a program that prints your name and favorite subject",
            [
              "Build a full sorting system",
              "Upload a Java video lesson",
              "Create a database migration",
            ],
          ),
        ],
        timeLimitSeconds: 300,
        title: "Welcome to Java Checkpoint",
      },
    ),
    unit(
      "variables-and-data-types",
      "Variables and Data Types",
      "Store information with the right Java types, update values, and name variables clearly.",
      [
        lesson(
          "variables-what-is-a-variable",
          "What is a variable?",
          {
            text: "A variable stores information so your program can use that value later. In Java you usually write the type, then the variable name, then the starting value.",
            example: "int age = 20;\nString name = \"Mia\";",
            tip: "Read a declaration from left to right: type, name, value. That pattern makes Java variables much easier to understand.",
            summary: "Variables are named places where Java remembers values.",
          },
          [
            mc(
              "What is a variable used for in Java?",
              "To store a value so the program can use it later",
              [
                "To store a value so the program can use it later",
                "To restart the computer",
                "To rename the keyboard",
                "To close the program",
              ],
              "Variables act like labeled storage boxes inside your program.",
            ),
            blank(
              "Complete the declaration: ___ age = 20;",
              "int",
              {
                acceptedAnswers: ["int"],
                explanation: "A whole number like 20 uses the type int.",
              },
            ),
            trace(
              "What value does score store after this code runs?",
              "12",
              {
                code: "int score = 10;\nscore = 12;",
                explanation: "The second line replaces the old value with 12.",
              },
            ),
          ],
        ),
        lesson(
          "variables-primitive-types",
          "int, double, char, boolean",
          {
            text: "Primitive types are Java's basic built-in value types. Beginners often start with int for whole numbers, double for decimals, char for single characters, and boolean for true-or-false values.",
            example: "int score = 95;\ndouble price = 12.5;\nchar grade = 'A';\nboolean passed = true;",
            tip: "Single characters use single quotes. Text with more than one character uses String instead.",
            summary: "Pick a primitive type that matches the kind of value you want to store.",
          },
          [
            mc(
              "Which Java type stores whole numbers?",
              "int",
              ["int", "double", "String", "boolean"],
              "Whole numbers like 4 or 99 are stored with int.",
            ),
            tf(
              "A boolean stores true or false.",
              "true",
              "boolean is Java's type for two-state values.",
            ),
            blank(
              "Choose the correct type: ___ price = 12.5;",
              "double",
              {
                acceptedAnswers: ["double"],
                explanation: "A decimal value like 12.5 should use double.",
              },
            ),
          ],
        ),
        lesson(
          "variables-strings-in-java",
          "Strings in Java",
          {
            text: "A String stores text such as names, messages, or full sentences. Even though String is not a primitive type, beginners use it constantly.",
            example: "String school = \"UniLearn\";\nString subject = \"Java\";\nSystem.out.println(school + \" teaches \" + subject);",
            tip: "String starts with a capital S in Java. That uppercase letter matters.",
            summary: "Use String when the value is text instead of a number or boolean.",
          },
          [
            tf(
              "A String stores text in Java.",
              "true",
              "String is the type used for names, words, and sentences.",
            ),
            blank(
              "Complete the declaration: ___ school = \"UniLearn\";",
              "String",
              {
                acceptedAnswers: ["String"],
                explanation: "Java uses String with a capital S for text values.",
              },
            ),
            predict(
              "What does this code print?",
              "Java Basics",
              {
                acceptedAnswers: ["Java Basics"],
                code: "String word = \"Java\";\nSystem.out.println(word + \" Basics\");",
                explanation: "The + operator joins the stored text with the extra word.",
              },
            ),
          ],
        ),
        lesson(
          "variables-changing-values",
          "Changing variable values",
          {
            text: "A variable can change after it is created. Java lets you give a variable a new value later in the program as long as the new value matches the type.",
            example: "int lives = 3;\nlives = 2;\nString status = \"draft\";\nstatus = \"done\";",
            tip: "Changing a variable uses its name only. You do not repeat the type every time you assign a new value.",
            summary: "Variables can be updated as your program changes state.",
          },
          [
            trace(
              "What is the final value of lives?",
              "2",
              {
                code: "int lives = 3;\nlives = 2;",
                explanation: "The second assignment updates the value from 3 to 2.",
              },
            ),
            mc(
              "Which line changes a variable that already exists?",
              "score = 18;",
              ["score = 18;", "int = score 18;", "score int 18;", "String score = 18;"],
              "Once a variable exists, you can update it with name = newValue;",
            ),
            blank(
              "Fill in the update: score ___ 18;",
              "=",
              {
                acceptedAnswers: ["="],
                explanation: "A simple reassignment uses the equals sign.",
                starter: "score ___ 18;",
              },
            ),
          ],
        ),
        lesson(
          "variables-naming-variables-correctly",
          "Naming variables correctly",
          {
            text: "Good variable names describe what the value means. In beginner Java, names like studentAge or totalScore are clearer than single letters for most real tasks.",
            example: "int studentAge = 16;\nString favoriteSubject = \"Science\";",
            tip: "Use camelCase for Java variable names. Start with a lowercase letter, then capitalize later words.",
            summary: "Clear names make code easier to read and easier to debug.",
          },
          [
            mc(
              "Which variable name is the clearest for a student's age?",
              "studentAge",
              ["studentAge", "x", "numberThing", "age value"],
              "studentAge is descriptive and follows Java naming style.",
            ),
            tf(
              "Variable names cannot contain spaces in Java.",
              "true",
              "A Java variable name must be one continuous identifier.",
            ),
            blank(
              "Choose a clear variable name: int ___ = 92; for a test score.",
              "testScore",
              {
                acceptedAnswers: ["testScore", "score"],
                explanation: "A descriptive camelCase name makes the value easier to understand.",
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "Which Java type stores whole numbers?",
            "int",
            ["String", "boolean", "class"],
          ),
          quizTf("A variable helps a program remember a value.", true),
          quizMc(
            "Which declaration correctly stores text?",
            "String name = \"Lina\";",
            [
              "int name = \"Lina\";",
              "boolean name = Lina;",
              "double name = true;",
            ],
          ),
          quizMc(
            "Which type is best for the value 12.5?",
            "double",
            ["int", "String", "char"],
          ),
          quizMc(
            "Which checkpoint task best fits this unit?",
            "Build a simple student info program",
            [
              "Draw a landing page animation",
              "Upload a media file",
              "Sort a list with bubble sort",
            ],
          ),
        ],
        timeLimitSeconds: 360,
        title: "Variables and Data Types Checkpoint",
      },
    ),
    unit(
      "operators-and-expressions",
      "Operators and Expressions",
      "Use arithmetic, assignment, comparisons, and logic to build stronger Java expressions.",
      [
        lesson(
          "operators-arithmetic-operators",
          "Arithmetic operators",
          {
            text: "Arithmetic operators let Java do math with values. Beginners often use plus, minus, multiply, divide, and remainder.",
            example: "int total = 8 + 4;\nint product = 6 * 2;\nint remainder = 7 % 3;",
            tip: "The percent symbol gives the remainder after division, which is handy for patterns and even-odd checks.",
            summary: "Arithmetic operators help Java calculate useful numeric results.",
          },
          [
            mc(
              "Which operator gives the remainder after division?",
              "%",
              ["%", "+", "==", "&&"],
              "The percent symbol returns the remainder after division.",
            ),
            trace(
              "What is the value of total after this code runs?",
              "14",
              {
                code: "int total = 8 + 6;",
                explanation: "8 plus 6 gives 14.",
              },
            ),
          ],
        ),
        lesson(
          "operators-assignment-operators",
          "Assignment operators",
          {
            text: "Assignment operators store or update values in variables. Besides =, Java also has shortcuts like += and -= for quick updates.",
            example: "int score = 6;\nscore += 3;\nscore -= 1;",
            tip: "Read += as add and store, and -= as subtract and store.",
            summary: "Assignment operators change values without repeating long expressions.",
          },
          [
            mc(
              "Which operator adds a value and stores the result back in the variable?",
              "+=",
              ["+=", "==", "%", "||"],
              "Use += when you want to add to the current value and save the result.",
            ),
            trace(
              "What is the final value of score?",
              "9",
              {
                code: "int score = 6;\nscore += 3;",
                explanation: "Adding 3 to 6 makes the final value 9.",
              },
            ),
          ],
        ),
        lesson(
          "operators-comparison-operators",
          "Comparison operators",
          {
            text: "Comparison operators compare values and return true or false. They are used in conditions and logical checks.",
            example: "boolean passed = score >= 50;\nboolean perfect = score == 100;",
            tip: "Use == to compare values. A single = assigns a value instead of comparing.",
            summary: "Comparison operators answer questions about equality and order.",
          },
          [
            mc(
              "Which operator checks if two values are equal?",
              "==",
              ["==", "=", "!=", "%"],
              "Double equals is the comparison operator for equality.",
            ),
            predict(
              "What does this code print?",
              "true",
              {
                acceptedAnswers: ["true"],
                code: "int grade = 75;\nSystem.out.println(grade >= 50);",
                explanation: "75 is greater than or equal to 50, so the result is true.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "operators-logical-operators",
          "Logical operators",
          {
            text: "Logical operators combine or reverse boolean values. Beginners mostly use && for AND, || for OR, and ! for NOT.",
            example: "boolean ready = loggedIn && paid;\nboolean needsHelp = !ready;",
            tip: "AND needs both sides to be true. OR needs at least one true side.",
            summary: "Logical operators help Java combine true-or-false checks.",
          },
          [
            mc(
              "Which logical operator means both conditions must be true?",
              "&&",
              ["&&", "||", "!", "+"],
              "Logical AND uses && and requires both sides to be true.",
            ),
            blank(
              "Fill in the operator that flips a boolean value: ___done",
              "!",
              {
                acceptedAnswers: ["!"],
                explanation: "The exclamation mark reverses a boolean value.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "operators-combining-expressions",
          "Combining expressions",
          {
            text: "Real Java programs often combine math, comparison, and logic in one expression. That makes it possible to calculate results and make decisions together.",
            example: "boolean passed = score >= 50 && attendance >= 80;\nint average = (math + science) / 2;",
            tip: "If an expression feels too long, store part of it in a separate variable first.",
            summary: "Combined expressions let several Java ideas work together in one result.",
          },
          [
            trace(
              "What is the value of passed?",
              "true",
              {
                code: "int score = 82;\nint attendance = 90;\nboolean passed = score >= 50 && attendance >= 80;",
                explanation: "Both checks are true, so the combined result is true.",
              },
            ),
            predict(
              "What does this code print?",
              "75",
              {
                acceptedAnswers: ["75"],
                code: "int math = 70;\nint science = 80;\nSystem.out.println((math + science) / 2);",
                explanation: "The average of 70 and 80 is 75.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "Which operator gives the remainder after division?",
            "%",
            ["+", "==", "&&"],
          ),
          quizTf("The expression 8 > 10 is false.", true),
          quizMc(
            "Which operator checks if two values are equal?",
            "==",
            ["=", "!", "||"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Calculate grades, totals, and averages",
            [
              "Create a seating chart",
              "Read text with Scanner",
              "Build a method-only calculator",
            ],
          ),
        ],
        timeLimitSeconds: 360,
        title: "Operators and Expressions Checkpoint",
      },
    ),
    unit(
      "input-and-output",
      "Input and Output",
      "Review output and start reading user input with Scanner for both numbers and text.",
      [
        lesson(
          "input-output-output-review",
          "Output review",
          {
            text: "Output means showing information to the user. In beginner Java, System.out.println is the most common way to display prompts and results.",
            example: "System.out.println(\"Welcome!\");\nSystem.out.println(12);",
            tip: "Clear output helps users understand what the program is asking for and what result it produced.",
            summary: "Output is how your Java program communicates with the user.",
          },
          [
            predict(
              "What does this code print?",
              "Welcome!",
              {
                acceptedAnswers: ["Welcome!"],
                code: "System.out.println(\"Welcome!\");",
                explanation: "println displays the exact text inside the quotes.",
              },
            ),
            mc(
              "Which line shows text to the user?",
              "System.out.println(\"Type your name:\");",
              [
                "System.out.println(\"Type your name:\");",
                "Scanner input = new Scanner(System.in);",
                "int age = 15;",
                "name = input.nextLine();",
              ],
              "Output lines usually display prompts or final results.",
              10,
            ),
          ],
        ),
        lesson(
          "input-output-reading-input-with-scanner",
          "Reading input with Scanner",
          {
            text: "Scanner is a Java class that reads input from the user. A beginner program often creates one Scanner object and then reuses it for each question.",
            example: "Scanner input = new Scanner(System.in);",
            tip: "Name the Scanner clearly, such as input or scanner, so it is obvious what the object is for.",
            summary: "Scanner helps Java collect what the user types.",
          },
          [
            reorder(
              "Put these tokens in order to create a Scanner.",
              "Scanner input = new Scanner(System.in);",
              ["Scanner", "input", "=", "new", "Scanner(System.in);"],
              "The usual beginner pattern is Scanner name = new Scanner(System.in);",
            ),
            mc(
              "Which Java class is commonly used to read keyboard input?",
              "Scanner",
              ["Scanner", "String", "System", "Main"],
              "Scanner is the standard beginner tool for console input.",
              10,
            ),
          ],
        ),
        lesson(
          "input-output-reading-numbers",
          "Reading numbers",
          {
            text: "Scanner can read whole numbers and decimals. Methods like nextInt and nextDouble match the kinds of values you want to store.",
            example: "int age = input.nextInt();\ndouble price = input.nextDouble();",
            tip: "Try to match the Scanner method to the variable type so your code stays clear and consistent.",
            summary: "Use numeric Scanner methods when the user needs to enter numbers.",
          },
          [
            mc(
              "Which Scanner method reads a whole number?",
              "nextInt()",
              ["nextInt()", "nextLine()", "nextText()", "nextWord()"],
              "nextInt reads a whole number from the input stream.",
            ),
            blank(
              "Choose the method for a decimal value: price = input.___;",
              "nextDouble()",
              {
                acceptedAnswers: ["nextDouble()", "nextDouble"],
                explanation: "Use nextDouble to read a decimal number.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "input-output-reading-text",
          "Reading text",
          {
            text: "When you want to read a full line of text such as a name or sentence, beginners usually use nextLine. That makes it easier to capture full text input.",
            example: "String name = input.nextLine();",
            tip: "If the user might type more than one word, nextLine is usually the safest beginner choice.",
            summary: "Use nextLine when the user should type text instead of a number.",
          },
          [
            mc(
              "Which Scanner method reads a full line of text?",
              "nextLine()",
              ["nextLine()", "nextInt()", "nextDouble()", "nextChar()"],
              "nextLine reads the whole line the user enters.",
            ),
            blank(
              "Complete the line: String name = input.___;",
              "nextLine()",
              {
                acceptedAnswers: ["nextLine()", "nextLine"],
                explanation: "nextLine is the common beginner method for full text input.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "input-output-mixing-input-and-output",
          "Mixing input and output",
          {
            text: "Most beginner programs show a prompt, read an answer, and then print a response. Mixing input and output is what makes the program feel interactive.",
            example: "System.out.println(\"What is your name?\");\nString name = input.nextLine();\nSystem.out.println(\"Hello, \" + name);",
            tip: "Keep the prompt close to the input line so the user always knows what to type next.",
            summary: "Interactive programs ask, read, and respond in a clear sequence.",
          },
          [
            predict(
              "If the user types Ava, what is printed last?",
              "Hello, Ava",
              {
                acceptedAnswers: ["Hello, Ava"],
                code: "String name = \"Ava\";\nSystem.out.println(\"Hello, \" + name);",
                explanation: "The final output joins the greeting with the name value.",
              },
            ),
            mc(
              "Which sequence makes the most sense in a beginner input program?",
              "Print a prompt, read input, then print a response",
              [
                "Print a prompt, read input, then print a response",
                "Read input before creating the program",
                "Sort values before asking a question",
                "Delete the class and then print text",
              ],
              "Interactive console programs usually ask, read, and respond in that order.",
              10,
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "Which class is commonly used to read user input in beginner Java?",
            "Scanner",
            ["System", "String", "Main"],
          ),
          quizTf("System.out.println is used to show output to the user.", true),
          quizMc(
            "Which Scanner method reads a whole number?",
            "nextInt()",
            ["nextLine()", "nextDouble()", "nextText()"],
          ),
          quizMc(
            "Which checkpoint task fits this unit?",
            "Make a small ask the user program",
            [
              "Sort numbers from smallest to largest",
              "Build a pass/fail checker",
              "Create a bubble sort visualizer",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Input and Output Checkpoint",
      },
    ),
    unit(
      "conditions",
      "Conditions",
      "Use if statements to make decisions, handle branches, and avoid common logic mistakes.",
      [
        lesson(
          "conditions-if-statements",
          "if statements",
          {
            text: "An if statement runs code only when a condition is true. It helps a program decide whether to do something or skip it.",
            example: "if (score >= 50) {\n  System.out.println(\"Passed\");\n}",
            tip: "The condition inside the parentheses must evaluate to true or false.",
            summary: "Use if when code should run only for a true condition.",
          },
          [
            mc(
              "When does an if block run?",
              "When its condition is true",
              [
                "When its condition is true",
                "Every single time",
                "Only when the program ends",
                "Only when a String is empty",
              ],
              "An if statement runs its block only if the condition evaluates to true.",
            ),
            trace(
              "What is printed when score is 80?",
              "Passed",
              {
                code: "int score = 80;\nif (score >= 50) {\n  System.out.println(\"Passed\");\n}",
                explanation: "Because 80 is at least 50, the if block runs and prints Passed.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "conditions-if-else",
          "if-else",
          {
            text: "An if-else statement lets a program choose between two paths. If the condition is true, Java runs the if block. Otherwise it runs the else block.",
            example: "if (age >= 18) {\n  System.out.println(\"Adult\");\n} else {\n  System.out.println(\"Minor\");\n}",
            tip: "Use else when there are exactly two main outcomes and one must happen.",
            summary: "if-else gives your program a clear yes-or-no branch.",
          },
          [
            mc(
              "What happens if the if condition is false in an if-else statement?",
              "The else block runs",
              [
                "The else block runs",
                "The whole program stops",
                "The class disappears",
                "The condition becomes true",
              ],
              "If the condition is false, Java uses the else branch instead.",
            ),
            predict(
              "What does this code print?",
              "Fail",
              {
                acceptedAnswers: ["Fail"],
                code: "int grade = 40;\nif (grade >= 50) {\n  System.out.println(\"Pass\");\n} else {\n  System.out.println(\"Fail\");\n}",
                explanation: "40 is not at least 50, so the else branch prints Fail.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "conditions-else-if",
          "else if",
          {
            text: "When you need more than two outcomes, else if lets you check extra conditions. Java moves through the conditions in order until one is true.",
            example: "if (score >= 90) {\n  System.out.println(\"A\");\n} else if (score >= 75) {\n  System.out.println(\"B\");\n} else {\n  System.out.println(\"Keep trying\");\n}",
            tip: "Put the most specific or highest condition first when order matters.",
            summary: "Use else if when a program needs more than two possible outcomes.",
          },
          [
            mc(
              "Why would you use else if?",
              "To check more than one possible condition",
              [
                "To check more than one possible condition",
                "To print without main",
                "To create an array",
                "To make Java ignore booleans",
              ],
              "else if is used when you have several possible cases.",
            ),
            trace(
              "What is printed when score is 75?",
              "B",
              {
                code: "int score = 75;\nif (score >= 90) {\n  System.out.println(\"A\");\n} else if (score >= 75) {\n  System.out.println(\"B\");\n} else {\n  System.out.println(\"C\");\n}",
                explanation: "The first condition is false, but the else if condition is true, so B is printed.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "conditions-nested-conditions",
          "Nested conditions",
          {
            text: "A nested condition is an if statement inside another if statement. This is useful when one decision only matters after another condition is already true.",
            example: "if (hasTicket) {\n  if (age >= 13) {\n    System.out.println(\"Enter\");\n  }\n}",
            tip: "Nested logic is easier to read when the outer condition checks the big rule and the inner condition checks a smaller detail.",
            summary: "Nested conditions let one decision happen inside another decision.",
          },
          [
            mc(
              "What is a nested condition?",
              "An if statement inside another if statement",
              [
                "An if statement inside another if statement",
                "A String inside an array",
                "A loop inside println",
                "A class inside a comment",
              ],
              "Nested conditions place one if block inside another.",
            ),
            trace(
              "What is printed?",
              "Enter",
              {
                code: "boolean hasTicket = true;\nint age = 14;\nif (hasTicket) {\n  if (age >= 13) {\n    System.out.println(\"Enter\");\n  }\n}",
                explanation: "Both the outer and inner conditions are true, so Enter is printed.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "conditions-common-condition-mistakes",
          "Common condition mistakes",
          {
            text: "Beginners often mix up = and ==, forget braces, or write conditions that do not produce a boolean result. Small mistakes in conditions can change the whole flow of a program.",
            example: "Use == to compare values, and keep braces around blocks so the branch is easy to read.",
            tip: "If a condition feels confusing, store part of it in a boolean variable first and test it with println.",
            summary: "Most condition bugs come from comparison mistakes, missing braces, or unclear logic.",
          },
          [
            mc(
              "Which symbol should you use to compare two values?",
              "==",
              ["==", "=", "+=", "&&&"],
              "Use double equals to compare values. A single equals sign assigns a value.",
            ),
            blank(
              "Conditions should produce a ___ value.",
              "boolean",
              {
                acceptedAnswers: ["boolean"],
                explanation: "An if condition must evaluate to true or false.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "When does an if statement run its block?",
            "When the condition is true",
            [
              "When the file name matches the class",
              "Every single time",
              "Only when a loop ends",
            ],
          ),
          quizTf("An if-else statement gives two possible branches.", true),
          quizMc(
            "What is the purpose of else if?",
            "To check an additional condition",
            ["To create a Scanner", "To store a String", "To sort an array"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Build a pass/fail or age-checker program",
            [
              "Create a seating chart",
              "Build a method calculator",
              "Sort numbers with bubble sort",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Conditions Checkpoint",
      },
    ),
    unit(
      "loops",
      "Loops",
      "Repeat actions with for and while loops, track counters, and handle nested repetition.",
      [
        lesson(
          "loops-why-loops-matter",
          "Why loops matter",
          {
            text: "Loops help your program repeat work without copying the same line again and again. They are useful when a task must happen several times or until a condition changes.",
            example: "Instead of printing numbers with five separate println lines, a loop can print them in one pattern.",
            tip: "If you notice repeated code that follows a clear pattern, a loop might be the better tool.",
            summary: "Loops make repeated work shorter, clearer, and easier to change.",
          },
          [
            mc(
              "Why are loops useful?",
              "They repeat actions without copying the same code many times",
              [
                "They repeat actions without copying the same code many times",
                "They remove the need for variables",
                "They turn every value into text",
                "They automatically create databases",
              ],
              "Loops help you repeat work in a cleaner way.",
            ),
            tf(
              "A loop can reduce repeated code in a beginner program.",
              "true",
              "That is one of the main reasons loops matter.",
              10,
            ),
          ],
        ),
        lesson(
          "loops-for-loop-basics",
          "for loop basics",
          {
            text: "A for loop is useful when you know how many times something should happen. It usually includes a starting value, a condition, and an update step.",
            example: "for (int i = 1; i <= 3; i++) {\n  System.out.println(i);\n}",
            tip: "Read a for loop as: start here, keep going while this is true, then update each round.",
            summary: "Use a for loop when you know the number of repetitions in advance.",
          },
          [
            reorder(
              "Put the parts in order to start a basic for loop.",
              "for (int i = 0; i < 3; i++)",
              ["for (", "int i = 0;", "i < 3;", "i++)"],
              "A beginner for loop includes a start, condition, and update in that order.",
            ),
            predict(
              "What does this code print?",
              "1\n2\n3",
              {
                acceptedAnswers: ["1\n2\n3", "1 2 3"],
                code: "for (int i = 1; i <= 3; i++) {\n  System.out.println(i);\n}",
                explanation: "The loop runs three times and prints 1, then 2, then 3.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "loops-while-loop-basics",
          "while loop basics",
          {
            text: "A while loop repeats as long as a condition stays true. It is useful when you do not know the exact number of repetitions ahead of time.",
            example: "int count = 0;\nwhile (count < 3) {\n  System.out.println(count);\n  count++;\n}",
            tip: "Make sure something inside the loop can change the condition, or the loop may never stop.",
            summary: "Use while when repetition depends on a condition instead of a fixed count.",
          },
          [
            mc(
              "What keeps a while loop running?",
              "Its condition stays true",
              [
                "Its condition stays true",
                "Its class name is capitalized",
                "Its file name is short",
                "Its variables are all Strings",
              ],
              "A while loop keeps running only while the condition is true.",
            ),
            trace(
              "What is printed by this loop?",
              "0\n1\n2",
              {
                acceptedAnswers: ["0\n1\n2", "0 1 2"],
                code: "int count = 0;\nwhile (count < 3) {\n  System.out.println(count);\n  count++;\n}",
                explanation: "The loop starts at 0 and prints until count reaches 3.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "loops-loop-counters",
          "Loop counters",
          {
            text: "A counter is a variable that tracks how many times something has happened in a loop. Counters are useful for totals, indexes, and repetition control.",
            example: "int count = 0;\nfor (int i = 0; i < 4; i++) {\n  count++;\n}",
            tip: "Counters often start at 0 and change by 1 each time through the loop.",
            summary: "Counters help a program track progress inside a loop.",
          },
          [
            trace(
              "What is the final value of count?",
              "4",
              {
                code: "int count = 0;\nfor (int i = 0; i < 4; i++) {\n  count++;\n}",
                explanation: "The loop runs four times, so count becomes 4.",
              },
            ),
            blank(
              "Fill in the update that increases the counter by 1: count___;",
              "++",
              {
                acceptedAnswers: ["++"],
                explanation: "The ++ operator increases the current value by 1.",
                starter: "count___;",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "loops-nested-loops",
          "Nested loops",
          {
            text: "A nested loop is a loop inside another loop. This is useful when your program works with rows and columns, repeated patterns, or repeated groups of repeated work.",
            example: "for (int row = 0; row < 2; row++) {\n  for (int col = 0; col < 2; col++) {\n    System.out.print(\"*\");\n  }\n  System.out.println();\n}",
            tip: "The outer loop controls big steps like rows. The inner loop controls smaller repeated steps like columns.",
            summary: "Nested loops repeat one loop inside another to build patterns and tables.",
          },
          [
            mc(
              "What is a nested loop?",
              "A loop inside another loop",
              [
                "A loop inside another loop",
                "A variable inside a comment",
                "A class inside a String",
                "A Scanner inside println",
              ],
              "Nested loops place one repeating structure inside another.",
            ),
            predict(
              "What does this code print?",
              "**\n**",
              {
                acceptedAnswers: ["**\n**", "** **"],
                code: "for (int row = 0; row < 2; row++) {\n  for (int col = 0; col < 2; col++) {\n    System.out.print(\"*\");\n  }\n  System.out.println();\n}",
                explanation: "The inner loop prints two stars for each row, and the outer loop repeats that for two rows.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "Why do loops matter?",
            "They let you repeat code without writing the same lines again and again",
            [
              "They replace every variable",
              "They remove the need for main",
              "They turn numbers into strings automatically",
            ],
          ),
          quizTf("A for loop is useful when you know the number of repetitions.", true),
          quizMc(
            "What keeps a while loop running?",
            "Its condition stays true",
            ["Its file name is correct", "Its class uses String", "Its output is empty"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Print number patterns or repeat actions with loops",
            [
              "Build a method calculator",
              "Read input with Scanner",
              "Create a marks table",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Loops Checkpoint",
      },
    ),
    unit(
      "methods-functions",
      "Methods (Functions)",
      "Break code into reusable methods with parameters, return values, and clear calls from main.",
      [
        lesson(
          "methods-what-is-a-method",
          "What is a method?",
          {
            text: "A method is a reusable block of code that performs one task. Methods help you organize a program so the same job does not need to be written again and again.",
            example: "public static void greet() {\n  System.out.println(\"Hello\");\n}",
            tip: "Give methods clear names based on what they do, like greet, printMenu, or calculateTotal.",
            summary: "Methods group related instructions into reusable pieces.",
          },
          [
            mc(
              "What is a method in Java?",
              "A reusable block of code that performs a task",
              [
                "A reusable block of code that performs a task",
                "A special comment inside a file",
                "A way to rename the JVM",
                "A data type for decimals",
              ],
              "Methods help organize and reuse code.",
            ),
            tf(
              "Methods can be called from main in a beginner Java program.",
              "true",
              "main often calls other methods to keep the program organized.",
              10,
            ),
          ],
        ),
        lesson(
          "methods-creating-your-own-methods",
          "Creating your own methods",
          {
            text: "You can define your own method inside the class so the program can call it later. A beginner method needs a return type, a name, and parentheses.",
            example: "public static void greet() {\n  System.out.println(\"Welcome\");\n}",
            tip: "Start with simple methods that print or calculate one clear thing. That makes the structure easier to learn.",
            summary: "A custom method is declared inside the class so it can be reused.",
          },
          [
            reorder(
              "Put the keywords in order to begin this method declaration.",
              "public static void greet",
              ["greet", "void", "static", "public"],
              "A beginner method often starts with public static void and then the method name.",
            ),
            mc(
              "Where do you create your own methods in beginner Java?",
              "Inside the class",
              ["Inside the class", "Inside a String", "Inside the file name", "Inside a comment"],
              "Methods are declared inside the class body.",
              10,
            ),
          ],
        ),
        lesson(
          "methods-parameters",
          "Parameters",
          {
            text: "Parameters let a method receive input values when it is called. They make a method more flexible because the same method can work with different data.",
            example: "public static void printName(String name) {\n  System.out.println(name);\n}",
            tip: "A parameter has a type and a name, just like a variable declaration.",
            summary: "Parameters are inputs passed into a method.",
          },
          [
            mc(
              "What is a parameter used for?",
              "To pass a value into a method",
              [
                "To pass a value into a method",
                "To end the whole program",
                "To rename a class",
                "To create a quiz automatically",
              ],
              "Parameters allow methods to receive information from the caller.",
            ),
            trace(
              "What is printed?",
              "5",
              {
                code: "public static void show(int value) {\n  System.out.println(value);\n}\n\nshow(5);",
                explanation: "The call passes 5 into the parameter value, so 5 is printed.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "methods-return-values",
          "Return values",
          {
            text: "Some methods send a result back to the part of the program that called them. This is done with a return value and the return keyword.",
            example: "public static int add(int a, int b) {\n  return a + b;\n}",
            tip: "If a method returns a value, the method type should match the kind of value it sends back.",
            summary: "Return values let a method calculate something and hand the result back.",
          },
          [
            mc(
              "Which keyword sends a value back from a method?",
              "return",
              ["return", "print", "class", "Scanner"],
              "The return keyword sends a result back to the caller.",
            ),
            trace(
              "What value does this method return?",
              "9",
              {
                code: "public static int add(int a, int b) {\n  return a + b;\n}\n\nadd(4, 5);",
                explanation: "The method adds 4 and 5 and returns 9.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "methods-calling-methods-from-main",
          "Calling methods from main",
          {
            text: "The main method often controls the overall program and calls smaller helper methods to do each job. This keeps the code easier to read and reuse.",
            example: "public static void main(String[] args) {\n  greet();\n}\n\npublic static void greet() {\n  System.out.println(\"Hello\");\n}",
            tip: "If your main method feels crowded, move repeated or separate tasks into smaller methods.",
            summary: "Calling methods from main helps structure a Java program into smaller steps.",
          },
          [
            mc(
              "What happens when main calls another method?",
              "Java runs that method's code",
              [
                "Java runs that method's code",
                "Java deletes the method",
                "Java exits the class",
                "Java changes every variable into a String",
              ],
              "Calling a method tells Java to execute that method's instructions.",
            ),
            trace(
              "What value is printed?",
              "8",
              {
                code: "public static int doubleNumber(int value) {\n  return value * 2;\n}\n\nSystem.out.println(doubleNumber(4));",
                explanation: "The method doubles 4 and returns 8, which is then printed.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "What is a method?",
            "A reusable block of code that performs a task",
            ["A data type for text", "A way to remove loops", "A file extension for Java"],
          ),
          quizTf("Parameters pass values into a method.", true),
          quizMc(
            "Which keyword sends a value back from a method?",
            "return",
            ["main", "print", "class"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Create a calculator with methods",
            [
              "Build a sorting tool",
              "Read user input with Scanner",
              "Create a marks table",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Methods Checkpoint",
      },
    ),
    unit(
      "arrays",
      "Arrays",
      "Store many values of the same type, access them by index, and process them with loops and methods.",
      [
        lesson(
          "arrays-what-is-an-array",
          "What is an array?",
          {
            text: "An array stores multiple values of the same type in order. It is useful when you have a list of related items like scores, names, or prices.",
            example: "int[] scores = {90, 80, 70};",
            tip: "All values in one array should be of the same type, such as all ints or all Strings.",
            summary: "Arrays hold several values together in one ordered structure.",
          },
          [
            mc(
              "What does an array store?",
              "Multiple values of the same type",
              [
                "Multiple values of the same type",
                "One value and one method",
                "Only booleans",
                "Only comments",
              ],
              "Arrays are designed to hold many related values of one type.",
            ),
            tf(
              "An array can store several values together.",
              "true",
              "That is the main purpose of an array.",
              10,
            ),
          ],
        ),
        lesson(
          "arrays-creating-and-filling-arrays",
          "Creating and filling arrays",
          {
            text: "You can create an array with values already inside it or create an empty array of a certain size and fill it later. Both patterns are common in beginner Java.",
            example: "int[] scores = {90, 80, 70};\nString[] names = new String[3];",
            tip: "Use curly braces when you already know the values. Use new type[size] when you want an empty array first.",
            summary: "Arrays can start full or start empty and be filled later.",
          },
          [
            mc(
              "Which declaration creates an array with values already inside it?",
              "int[] scores = {90, 80, 70};",
              [
                "int[] scores = {90, 80, 70};",
                "int scores = [90, 80, 70];",
                "scores[] = 90, 80, 70;",
                "new scores int = 3;",
              ],
              "The curly brace form creates and fills the array in one line.",
            ),
            trace(
              "What value is stored at index 1?",
              "80",
              {
                code: "int[] scores = {90, 80, 70};",
                explanation: "Index 1 refers to the second value, which is 80.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "arrays-accessing-array-elements",
          "Accessing array elements",
          {
            text: "Each array value has an index, and Java starts counting at 0. That means the first item is at index 0, the second is at index 1, and so on.",
            example: "String[] names = {\"Ava\", \"Leo\", \"Mia\"};\nSystem.out.println(names[0]);",
            tip: "Beginners often forget that arrays start at 0. Keep that in mind every time you access a value.",
            summary: "Use array indexes to read or change specific values.",
          },
          [
            mc(
              "What is the index of the first item in a Java array?",
              "0",
              ["0", "1", "2", "-1"],
              "Java arrays start at index 0.",
            ),
            trace(
              "What value does names[2] return?",
              "Mia",
              {
                code: "String[] names = {\"Ava\", \"Leo\", \"Mia\"};",
                explanation: "Index 2 refers to the third item, which is Mia.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "arrays-looping-through-arrays",
          "Looping through arrays",
          {
            text: "Loops and arrays work very well together. A loop can move through each index one by one so your program can print, total, or inspect every value.",
            example: "for (int i = 0; i < scores.length; i++) {\n  System.out.println(scores[i]);\n}",
            tip: "The length property tells you how many values are in the array, which is helpful for loop conditions.",
            summary: "Use loops to process every item in an array without repeating code.",
          },
          [
            mc(
              "Why are loops useful with arrays?",
              "They let you process every element one by one",
              [
                "They let you process every element one by one",
                "They remove the need for indexes",
                "They change arrays into methods",
                "They stop Java from using variables",
              ],
              "A loop can move through each array index in order.",
            ),
            trace(
              "What is the final value of total?",
              "6",
              {
                code: "int[] values = {1, 2, 3};\nint total = 0;\nfor (int i = 0; i < values.length; i++) {\n  total += values[i];\n}",
                explanation: "The loop adds 1, then 2, then 3, producing 6.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "arrays-arrays-as-method-parameters",
          "Arrays as method parameters",
          {
            text: "Methods can receive arrays as parameters just like they receive individual values. This lets one method work on many values at once.",
            example: "public static void printFirst(int[] values) {\n  System.out.println(values[0]);\n}",
            tip: "When a method takes an array, the parameter type includes square brackets, such as int[] values.",
            summary: "Passing arrays into methods helps you reuse logic for many values.",
          },
          [
            mc(
              "Can an array be passed into a method?",
              "Yes",
              ["Yes", "No", "Only if it is empty", "Only if it is a String"],
              "Arrays can absolutely be used as method parameters.",
            ),
            trace(
              "What is printed?",
              "9",
              {
                code: "public static void printFirst(int[] values) {\n  System.out.println(values[0]);\n}\n\nint[] numbers = {9, 4, 2};\nprintFirst(numbers);",
                explanation: "The method prints the first element of the array, which is 9.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "What is an array used for?",
            "Storing multiple values of the same type",
            [
              "Storing one method and one loop",
              "Replacing the main method",
              "Sorting text automatically",
            ],
          ),
          quizTf("Java arrays start at index 0.", true),
          quizMc(
            "Why are loops useful with arrays?",
            "They help process every element",
            [
              "They remove the need for array length",
              "They stop arrays from holding values",
              "They make every index equal to 1",
            ],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Find the largest number in an array",
            [
              "Build a pass/fail checker",
              "Read user input with Scanner",
              "Create a 2D seating chart",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Arrays Checkpoint",
      },
    ),
    unit(
      "two-dimensional-arrays",
      "Two-Dimensional Arrays",
      "Work with rows and columns of data using 2D arrays and nested loops.",
      [
        lesson(
          "two-dimensional-what-is-a-2d-array",
          "What is a 2D array?",
          {
            text: "A two-dimensional array stores data in rows and columns, like a table or grid. It is useful when a single list is not enough to represent the data.",
            example: "int[][] marks = {\n  {80, 90},\n  {70, 85}\n};",
            tip: "You can picture a 2D array like a spreadsheet with row and column positions.",
            summary: "A 2D array is a grid of values arranged in rows and columns.",
          },
          [
            mc(
              "What does a 2D array represent?",
              "A table or grid of values",
              [
                "A table or grid of values",
                "A single boolean value",
                "A method with two parameters",
                "A comment across two files",
              ],
              "2D arrays are useful for table-like or grid-like data.",
            ),
            tf(
              "A 2D array has rows and columns.",
              "true",
              "That row-and-column structure is what makes it two-dimensional.",
              10,
            ),
          ],
        ),
        lesson(
          "two-dimensional-rows-and-columns",
          "Rows and columns",
          {
            text: "In a 2D array, the first index selects the row and the second index selects the column. That lets you move to one exact cell in the grid.",
            example: "marks[1][0] means row 1, column 0.",
            tip: "Say the indexes out loud: row first, column second. That helps prevent mix-ups.",
            summary: "Use the first index for the row and the second index for the column.",
          },
          [
            mc(
              "In a 2D array access like grid[1][2], what does the first index represent?",
              "The row",
              ["The row", "The column", "The method name", "The return type"],
              "The first index chooses the row in the grid.",
            ),
            trace(
              "What value is stored at table[1][0]?",
              "3",
              {
                code: "int[][] table = {\n  {1, 2},\n  {3, 4}\n};",
                explanation: "Row 1, column 0 points to the value 3.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "two-dimensional-accessing-elements",
          "Accessing elements",
          {
            text: "You access one value in a 2D array by giving both indexes. This is how a program reads or updates a single cell in the grid.",
            example: "String[][] seats = {{\"A1\", \"A2\"}, {\"B1\", \"B2\"}};\nSystem.out.println(seats[0][1]);",
            tip: "The same 0-based indexing rule still applies in every row and every column.",
            summary: "A 2D array element is accessed with two indexes in square brackets.",
          },
          [
            trace(
              "What value does grid[0][1] return?",
              "9",
              {
                code: "int[][] grid = {\n  {5, 9},\n  {2, 8}\n};",
                explanation: "Row 0, column 1 is the value 9.",
              },
            ),
            mc(
              "Which expression accesses the value in row 2, column 1 of marks?",
              "marks[2][1]",
              ["marks[1][2]", "marks[2][1]", "marks(2,1)", "marks[2,1]"],
              "A 2D array element is accessed with two bracketed indexes.",
              10,
            ),
          ],
        ),
        lesson(
          "two-dimensional-nested-loops-with-2d-arrays",
          "Nested loops with 2D arrays",
          {
            text: "Because a 2D array has rows and columns, nested loops are a natural tool for moving through every value in the grid. The outer loop usually handles rows and the inner loop handles columns.",
            example: "for (int row = 0; row < grid.length; row++) {\n  for (int col = 0; col < grid[row].length; col++) {\n    System.out.println(grid[row][col]);\n  }\n}",
            tip: "Read the outer loop as choose a row, then read the inner loop as move across the columns in that row.",
            summary: "Nested loops let a program process every value in a 2D array.",
          },
          [
            mc(
              "Why do nested loops fit 2D arrays so well?",
              "One loop can handle rows and the other can handle columns",
              [
                "One loop can handle rows and the other can handle columns",
                "They make every array one-dimensional",
                "They remove the need for indexes",
                "They turn numbers into classes",
              ],
              "A 2D array has two layers of movement, so nested loops match that structure.",
            ),
            predict(
              "What does this code print?",
              "1\n2\n3\n4",
              {
                acceptedAnswers: ["1\n2\n3\n4", "1 2 3 4"],
                code: "int[][] grid = {\n  {1, 2},\n  {3, 4}\n};\nfor (int row = 0; row < grid.length; row++) {\n  for (int col = 0; col < grid[row].length; col++) {\n    System.out.println(grid[row][col]);\n  }\n}",
                explanation: "The nested loops visit each value in row order: 1, 2, 3, then 4.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "two-dimensional-real-examples",
          "Real examples like grades, seating, or grid data",
          {
            text: "2D arrays are useful for marks tables, seating charts, pixel grids, and any data that naturally fits rows and columns. They help a program organize related values in a structured way.",
            example: "String[][] seats = {{\"A1\", \"A2\"}, {\"B1\", \"B2\"}};",
            tip: "Before you choose a 2D array, ask whether the problem naturally has rows and columns.",
            summary: "Use a 2D array when your data feels like a table or grid.",
          },
          [
            mc(
              "Which task is a good fit for a 2D array?",
              "A classroom seating chart",
              [
                "A classroom seating chart",
                "A single student name",
                "A boolean pass/fail flag",
                "A method return type",
              ],
              "A seating chart is naturally arranged in rows and columns.",
            ),
            trace(
              "What value is stored at seats[0][1]?",
              "A2",
              {
                code: "String[][] seats = {{\"A1\", \"A2\"}, {\"B1\", \"B2\"}};",
                explanation: "Row 0, column 1 is A2.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "What is a 2D array useful for?",
            "Table or grid data",
            ["Single decimal values", "Only method names", "Only one-dimensional lists"],
          ),
          quizTf("The first index in a 2D array access selects the row.", true),
          quizMc(
            "Why are nested loops useful with 2D arrays?",
            "They process rows and columns",
            ["They remove the array length", "They stop printing output", "They replace all variables"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Build a simple marks table or matrix display",
            [
              "Search for a name in a list",
              "Sort numbers from smallest to largest",
              "Create a calculator with methods",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Two-Dimensional Arrays Checkpoint",
      },
    ),
    unit(
      "searching",
      "Searching",
      "Practice basic algorithmic thinking by finding targets and returning positions in arrays.",
      [
        lesson(
          "searching-what-is-searching",
          "What is searching?",
          {
            text: "Searching means looking through data to find a target value. In beginner Java, that often means checking whether a number or name appears in an array.",
            example: "You might search a list of scores to see whether a specific value is present.",
            tip: "A search is easier to reason about when you clearly name the target value you want to find.",
            summary: "Searching is the process of checking data to find a wanted value.",
          },
          [
            mc(
              "What does searching mean in programming?",
              "Looking through data to find a target",
              [
                "Looking through data to find a target",
                "Turning text into numbers",
                "Printing every line twice",
                "Creating a class automatically",
              ],
              "Searching is about finding whether and where a value appears.",
            ),
            tf(
              "Linear search checks items one by one.",
              "true",
              "That step-by-step check is what makes linear search simple.",
              10,
            ),
          ],
        ),
        lesson(
          "searching-linear-search",
          "Linear search",
          {
            text: "Linear search starts at the beginning of the list and checks each element until it finds the target or reaches the end. It is simple and beginner-friendly.",
            example: "for (int i = 0; i < values.length; i++) {\n  if (values[i] == target) {\n    // found it\n  }\n}",
            tip: "Linear search can stop early as soon as the target is found.",
            summary: "Linear search checks values one by one in order.",
          },
          [
            reorder(
              "Put these pieces in order for the start of a linear search loop.",
              "for (int i = 0; i < numbers.length; i++)",
              ["for (", "int i = 0;", "i < numbers.length;", "i++)"],
              "A basic linear search uses a for loop to move through the array.",
            ),
            trace(
              "At which index is the value 9 found?",
              "2",
              {
                code: "int[] numbers = {4, 7, 9, 12};",
                explanation: "The value 9 appears at index 2.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "searching-searching-in-arrays",
          "Searching in arrays",
          {
            text: "When you search in an array, you compare each element to the target value. If the current element matches, the program can record the result or stop.",
            example: "if (numbers[i] == target) {\n  found = true;\n}",
            tip: "A boolean like found can help you remember whether the target was seen.",
            summary: "Searching in arrays compares each element to a target value.",
          },
          [
            mc(
              "Which comparison checks whether the current element matches the target?",
              "numbers[i] == target",
              [
                "numbers[i] == target",
                "numbers[i] = target",
                "target + numbers[i]",
                "numbers.length == i + target",
              ],
              "Use == to compare the current array value with the target.",
            ),
            trace(
              "What is the value of found after this check?",
              "true",
              {
                code: "int[] numbers = {3, 5, 8};\nint target = 5;\nboolean found = false;\nfor (int i = 0; i < numbers.length; i++) {\n  if (numbers[i] == target) {\n    found = true;\n  }\n}",
                explanation: "Because the array contains 5, the variable found becomes true.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "searching-returning-positions-results",
          "Returning positions/results",
          {
            text: "A search can return useful information such as the index where a target was found. If the target is not present, beginners often return -1 to mean not found.",
            example: "if (numbers[i] == target) {\n  return i;\n}\nreturn -1;",
            tip: "Pick one clear result for not found and use it consistently in your program.",
            summary: "Search results often return an index when found and -1 when not found.",
          },
          [
            mc(
              "What does a search often return when the target is missing?",
              "-1",
              ["-1", "1", "true", "null class"],
              "Many beginner search methods use -1 to show that the target was not found.",
            ),
            blank(
              "Fill in the common not-found result: return ___;",
              "-1",
              {
                acceptedAnswers: ["-1"],
                explanation: "A common beginner pattern is to return -1 when the value is missing.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "searching-comparing-search-outcomes",
          "Comparing search outcomes",
          {
            text: "After a search finishes, your program can compare the result to decide what happens next. For example, an index of -1 might lead to a not found message, while any other index means success.",
            example: "if (position == -1) {\n  System.out.println(\"Not found\");\n} else {\n  System.out.println(\"Found at index \" + position);\n}",
            tip: "A search result is more useful when the program clearly explains what it means to the user.",
            summary: "Programs use search results to decide whether something was found and what message to show.",
          },
          [
            mc(
              "What does a result of -1 usually mean after a search?",
              "The target was not found",
              [
                "The target was not found",
                "The target was at the first position",
                "The array was sorted",
                "The method returned a String",
              ],
              "A result of -1 is the common not-found signal.",
            ),
            predict(
              "What does this code print when position is 2?",
              "Found at index 2",
              {
                acceptedAnswers: ["Found at index 2"],
                code: "int position = 2;\nif (position == -1) {\n  System.out.println(\"Not found\");\n} else {\n  System.out.println(\"Found at index \" + position);\n}",
                explanation: "Because the position is not -1, the success message is printed.",
                xpReward: 10,
              },
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "What is searching?",
            "Looking through data to find a target",
            [
              "Repeating a loop forever",
              "Turning text into a boolean",
              "Creating a class with no methods",
            ],
          ),
          quizTf("Linear search checks items one by one.", true),
          quizMc(
            "What does a result of -1 usually mean?",
            "The target was not found",
            ["The target was found at index 1", "The array is full", "The method printed output"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Search for a number or name in a list",
            [
              "Sort numbers from smallest to largest",
              "Build a marks table",
              "Create a calculator with methods",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Searching Checkpoint",
      },
    ),
    unit(
      "sorting",
      "Sorting",
      "Understand why sorting matters and follow bubble sort and selection sort step by step.",
      [
        lesson(
          "sorting-why-sorting-matters",
          "Why sorting matters",
          {
            text: "Sorting means arranging values in order, such as smallest to largest or A to Z. Sorted data is easier to read, compare, and often easier to search.",
            example: "A score list like 92, 75, 88 becomes easier to understand when it is sorted into 75, 88, 92.",
            tip: "Before sorting, decide what order you want: ascending or descending.",
            summary: "Sorting organizes values so the data becomes easier to work with.",
          },
          [
            mc(
              "Why does sorting matter?",
              "It puts data into a useful order",
              [
                "It puts data into a useful order",
                "It removes the need for arrays",
                "It makes every search return -1",
                "It turns methods into comments",
              ],
              "Sorting arranges data in an order that is easier to read and process.",
            ),
            tf(
              "Sorted data is often easier to read and compare.",
              "true",
              "That is one of the main reasons sorting is useful.",
              10,
            ),
          ],
        ),
        lesson(
          "sorting-bubble-sort-idea",
          "Bubble sort idea",
          {
            text: "Bubble sort compares neighboring values and swaps them when they are out of order. Repeating that process pushes larger values toward the end of the list.",
            example: "Compare 3 and 1, swap them, then compare the next pair, and keep moving through the array.",
            tip: "Bubble sort is not the fastest algorithm, but it is great for learning how sorting works step by step.",
            summary: "Bubble sort works by repeatedly comparing neighbors and swapping when needed.",
          },
          [
            mc(
              "What does bubble sort compare first?",
              "Neighboring values",
              ["Neighboring values", "Only the first and last values", "Only even numbers", "Only Strings"],
              "Bubble sort works by checking pairs that are next to each other.",
            ),
            trace(
              "What is the array after one full bubble-sort pass?",
              "1 2 3",
              {
                acceptedAnswers: ["1 2 3", "1,2,3"],
                code: "int[] numbers = {3, 1, 2};",
                explanation: "After comparing and swapping neighbors across the list, the array becomes 1 2 3.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "sorting-selection-sort-idea",
          "Selection sort idea",
          {
            text: "Selection sort looks for the smallest remaining value and places it in the next correct position. Then it repeats that process for the rest of the array.",
            example: "If the list is 4, 1, 3, selection sort chooses 1 as the smallest and moves it to the front.",
            tip: "Selection sort focuses on picking the best next value, not repeatedly swapping neighbors.",
            summary: "Selection sort finds the smallest remaining value and places it where it belongs.",
          },
          [
            mc(
              "What does selection sort try to choose on each pass?",
              "The smallest remaining value",
              [
                "The smallest remaining value",
                "The largest method name",
                "The middle element only",
                "A random index",
              ],
              "Selection sort searches for the smallest unsorted value on each pass.",
            ),
            trace(
              "What does the array look like after the first selection-sort pass?",
              "1 4 3",
              {
                acceptedAnswers: ["1 4 3", "1,4,3"],
                code: "int[] numbers = {4, 1, 3};",
                explanation: "The smallest value, 1, moves into the first position on the first pass.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "sorting-comparing-values-while-sorting",
          "Comparing values while sorting",
          {
            text: "Sorting relies on comparing values to decide whether they are already in the right order. In ascending order, smaller values should appear before larger ones.",
            example: "If left > right, a beginner ascending sort often swaps those two values.",
            tip: "Keep the target order in mind. For ascending order, you want smaller numbers to move left.",
            summary: "Sorting decisions come from repeated value comparisons.",
          },
          [
            mc(
              "In ascending order, when should two neighboring values be swapped?",
              "When the left value is greater than the right value",
              [
                "When the left value is greater than the right value",
                "When both values are equal",
                "When the left value is smaller than the right value",
                "Only when the values are Strings",
              ],
              "If the left value is bigger, the pair is out of ascending order.",
            ),
            tf(
              "Sorting depends on comparing values again and again.",
              "true",
              "Each step of a sort uses comparisons to decide what to do next.",
              10,
            ),
          ],
        ),
        lesson(
          "sorting-sorting-arrays-step-by-step",
          "Sorting arrays step by step",
          {
            text: "A sorting algorithm becomes easier to understand when you follow each pass carefully. Watching values move step by step helps beginners see how the final order appears.",
            example: "Starting with 5, 2, 8, 1, repeated comparisons and swaps gradually create 1, 2, 5, 8.",
            tip: "When tracing a sort, write the array after each pass. That makes the changes much easier to follow.",
            summary: "Sorting is a sequence of small comparisons and swaps that create a final ordered list.",
          },
          [
            trace(
              "What is the sorted order of these values?",
              "1 2 5 8",
              {
                acceptedAnswers: ["1 2 5 8", "1,2,5,8"],
                code: "int[] values = {5, 2, 8, 1};",
                explanation: "Ascending order places the values from smallest to largest: 1, 2, 5, 8.",
              },
            ),
            reorder(
              "Put these values in ascending order.",
              "1 2 5 8",
              ["5", "1", "8", "2"],
              "Ascending order means smallest to largest.",
              10,
            ),
          ],
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "Why does sorting matter?",
            "It arranges data into a useful order",
            [
              "It removes the need for arrays",
              "It stops loops from repeating",
              "It replaces every method",
            ],
          ),
          quizTf("Bubble sort compares neighboring values.", true),
          quizMc(
            "What does selection sort look for on each pass?",
            "The smallest remaining value",
            ["The largest method", "Only the first value", "A random index"],
          ),
          quizMc(
            "Which checkpoint goal matches this unit?",
            "Sort numbers from smallest to largest",
            [
              "Search for a name in a list",
              "Build a marks table",
              "Create a calculator with methods",
            ],
          ),
        ],
        timeLimitSeconds: 420,
        title: "Sorting Checkpoint",
      },
    ),
    unit(
      "final-review-and-mini-project",
      "Final Review and Mini Project",
      "Review the core Java building blocks and combine them into one beginner-friendly mini project.",
      [
        lesson(
          "final-review-variables-review",
          "Variables review",
          {
            text: "Variables still matter in the final unit because every mini project stores names, scores, counts, or messages. Reviewing types and updates helps make the final project more reliable.",
            example: "String studentName = \"Ava\";\nint totalScore = 82;\nboolean passed = true;",
            tip: "Before writing a bigger program, list the values you need to store and choose their types first.",
            summary: "Projects use variables to remember all the important values they work with.",
          },
          [
            mc(
              "Which declaration correctly stores text?",
              "String title = \"Java Review\";",
              [
                "String title = \"Java Review\";",
                "int title = \"Java Review\";",
                "boolean title = Java Review;",
                "double title = true;",
              ],
              "String is the correct type for text values.",
            ),
            trace(
              "What is the final value of level?",
              "2",
              {
                code: "int level = 1;\nlevel = 2;",
                explanation: "The second assignment updates the value to 2.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "final-review-conditions-and-loops-review",
          "Conditions and loops review",
          {
            text: "Conditions help a project make choices, and loops help it repeat work. Many beginner programs combine both, such as checking values while moving through a list.",
            example: "for (int i = 0; i < scores.length; i++) {\n  if (scores[i] >= 50) {\n    passedCount++;\n  }\n}",
            tip: "When logic gets busy, solve it in steps: loop first, then check the condition inside the loop.",
            summary: "Conditions and loops often work together to process data and make decisions.",
          },
          [
            mc(
              "Which structure repeats code?",
              "A loop",
              ["A loop", "A String", "A comment", "A return type"],
              "Loops repeat work. Conditions choose whether work should happen.",
            ),
            trace(
              "How many even numbers are counted?",
              "2",
              {
                code: "int[] numbers = {2, 3, 4};\nint evenCount = 0;\nfor (int i = 0; i < numbers.length; i++) {\n  if (numbers[i] % 2 == 0) {\n    evenCount++;\n  }\n}",
                explanation: "The values 2 and 4 are even, so the count ends at 2.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "final-review-methods-and-arrays-review",
          "Methods and arrays review",
          {
            text: "Methods and arrays work well together in projects. A method can receive an array, process the values, and return a useful result such as a total, average, or largest number.",
            example: "public static int sum(int[] values) {\n  int total = 0;\n  for (int i = 0; i < values.length; i++) {\n    total += values[i];\n  }\n  return total;\n}",
            tip: "If a task works on many values, consider passing the array into a method so the main program stays clean.",
            summary: "Projects often combine methods and arrays to organize repeated data work.",
          },
          [
            mc(
              "Why would you pass an array into a method?",
              "To let the method work on multiple values",
              [
                "To let the method work on multiple values",
                "To remove the array indexes forever",
                "To replace every loop with if statements",
                "To stop methods from returning values",
              ],
              "Passing an array into a method lets that method process many values at once.",
            ),
            trace(
              "What value is printed?",
              "6",
              {
                code: "int[] values = {1, 2, 3};\nint total = 0;\nfor (int i = 0; i < values.length; i++) {\n  total += values[i];\n}\nSystem.out.println(total);",
                explanation: "The values 1, 2, and 3 add up to 6.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "final-review-classes-review",
          "Classes review",
          {
            text: "A class is the structure that groups related code together. Even in beginner Java, classes matter because methods, variables, and the main method all live inside them.",
            example: "public class GradeManager {\n  public static void main(String[] args) {\n    System.out.println(\"Start\");\n  }\n}",
            tip: "At this stage, think of a class as the container that holds your program pieces together.",
            summary: "Classes organize the code that belongs together in a Java program.",
          },
          [
            mc(
              "What does a class do in beginner Java?",
              "It groups related code together",
              [
                "It groups related code together",
                "It stores only decimals",
                "It replaces all methods",
                "It runs without main or braces",
              ],
              "A class is the container that holds related parts of the program.",
            ),
            blank(
              "Fill in the keyword: public ___ Main { }",
              "class",
              {
                acceptedAnswers: ["class"],
                explanation: "The keyword that defines a class is class.",
                xpReward: 10,
              },
            ),
          ],
        ),
        lesson(
          "final-review-final-mini-project",
          "Final mini project",
          {
            text: "The final mini project brings your beginner Java tools together. A good project uses variables, conditions, loops, methods, arrays, and clear output to solve one useful small problem.",
            example: "A student grade manager could store scores in an array, use methods to calculate averages, and use conditions to print pass or fail messages.",
            tip: "Choose one small goal, then build it in steps: input, store values, process them, and print the result clearly.",
            summary: "A strong mini project combines the key beginner concepts into one practical program.",
          },
          [
            mc(
              "Which project idea best combines the topics from this path?",
              "A student grade manager",
              [
                "A student grade manager",
                "A video upload dashboard",
                "A cloud database migration tool",
                "A 3D game engine",
              ],
              "A student grade manager can use variables, arrays, methods, conditions, and output in one project.",
            ),
            predict(
              "What does this line print if average is 80?",
              "Average: 80",
              {
                acceptedAnswers: ["Average: 80"],
                code: "int average = 80;\nSystem.out.println(\"Average: \" + average);",
                explanation: "The message joins the text with the value stored in average.",
                xpReward: 10,
              },
            ),
          ],
          { durationSeconds: 420, xpReward: 30 },
        ),
      ],
      {
        passScore: 70,
        questions: [
          quizMc(
            "Which type would you use for a student's name?",
            "String",
            ["int", "boolean", "double"],
          ),
          quizTf("Loops and conditions can work together in the same project.", true),
          quizMc(
            "What is the role of a class in beginner Java?",
            "It groups related code together",
            ["It stores only one boolean", "It replaces methods", "It removes the need for main"],
          ),
          quizMc(
            "Which mini project idea fits the final unit?",
            "A quiz score calculator",
            ["A payment subscription service", "A landing page animation library", "A video editing pipeline"],
          ),
        ],
        timeLimitSeconds: 480,
        title: "Final Review and Mini Project Checkpoint",
      },
    ),
  ] satisfies JavaCurriculumUnit[],
} as const;
