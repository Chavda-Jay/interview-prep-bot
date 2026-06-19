from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path
import random
import json
import re

# Load .env file for local development (on Render, env vars are set directly)
env_path = Path(__file__).resolve().parent.parent.parent / "config" / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# ─────────────────────────────────────────────────────────────
# Topic Pools — SEPARATED BY LEVEL
# ─────────────────────────────────────────────────────────────

TOPIC_POOLS = {
    "Python": {
        "beginner": [
            "variables and data types", "print and input functions", "if-else conditions",
            "for loops", "while loops", "lists", "tuples", "dictionaries",
            "strings and string methods", "functions", "return statement",
            "type conversion", "operators (arithmetic, comparison, logical)",
            "comments and code readability", "basic math operations",
            "range() function", "len() function", "indexing and slicing",
            "boolean values", "None keyword",
        ],
        "intermediate": [
            "list comprehensions", "dictionary comprehensions", "lambda functions",
            "map, filter, reduce", "exception handling (try/except/finally)",
            "*args and **kwargs", "file handling (read/write)",
            "modules and imports", "pip and packages", "virtual environments",
            "OOP basics (class and object)", "inheritance", "string formatting (f-strings)",
            "sets and set operations", "enumerate and zip",
            "decorators basics", "generators", "recursion",
            "shallow vs deep copy", "regular expressions basics",
        ],
        "advanced": [
            "metaclasses", "descriptors", "context managers",
            "async/await and asyncio", "GIL (Global Interpreter Lock)",
            "multithreading vs multiprocessing", "memory management",
            "design patterns in Python", "abstract base classes",
            "type hints and generics", "dataclasses", "slots",
            "property decorators", "closures and scope",
            "itertools and functools", "coroutines",
            "garbage collection internals", "C extensions",
            "profiling and optimization", "dunder methods (__getattr__, __slots__)",
        ],
    },
    "React": {
        "beginner": [
            "what is React and why use it", "JSX basics", "components (functional)",
            "props", "state with useState", "event handling (onClick, onChange)",
            "conditional rendering", "rendering lists", "importing and exporting components",
            "styling in React (inline, CSS)", "React project structure",
            "creating a simple form", "handling user input",
            "parent to child data passing", "React vs plain HTML/JS",
            "installing React with create-react-app or Vite",
            "fragments", "React DevTools basics", "keys in lists", "basic hooks overview",
        ],
        "intermediate": [
            "useEffect hook", "useContext hook", "useRef hook",
            "custom hooks", "React Router (routing and navigation)",
            "controlled vs uncontrolled components", "form validation",
            "API calls with fetch/axios", "loading and error states",
            "lifting state up", "context API for global state",
            "useMemo and useCallback", "component lifecycle",
            "React.memo for optimization", "error boundaries",
            "code splitting with lazy/Suspense", "prop drilling problem",
            "useReducer hook", "environment variables in React", "deployment basics",
        ],
        "advanced": [
            "virtual DOM and reconciliation", "React Fiber architecture",
            "server-side rendering (SSR)", "React Server Components",
            "higher-order components (HOC)", "render props pattern",
            "Redux and state management", "Redux Toolkit",
            "performance profiling", "concurrent features",
            "hydration", "Suspense for data fetching",
            "testing with React Testing Library", "compound component pattern",
            "portals", "forwardRef and useImperativeHandle",
            "micro-frontend architecture", "design system with React",
            "accessibility (a11y) in React", "React Native comparison",
        ],
    },
    "JavaScript": {
        "beginner": [
            "variables (var, let, const)", "data types (string, number, boolean)",
            "operators", "if-else and switch", "for and while loops",
            "functions and return", "arrays and array methods (push, pop, map)",
            "objects", "template literals", "string methods",
            "console.log and debugging", "type conversion",
            "comparison operators (== vs ===)", "scope (global vs local)",
            "basic DOM manipulation (getElementById)", "events (click, submit)",
            "alert, prompt, confirm", "Math object", "Date object basics",
            "JSON (parse and stringify)",
        ],
        "intermediate": [
            "closures", "callbacks", "promises", "async/await",
            "arrow functions", "destructuring", "spread and rest operators",
            "higher-order functions", "array methods (filter, reduce, find)",
            "error handling (try/catch)", "modules (import/export)",
            "this keyword", "event bubbling and delegation",
            "fetch API", "localStorage and sessionStorage",
            "regular expressions", "setTimeout and setInterval",
            "object methods (keys, values, entries)", "Map and Set",
            "hoisting", "strict mode",
        ],
        "advanced": [
            "event loop and call stack", "microtasks vs macrotasks",
            "prototypal inheritance", "Proxy and Reflect",
            "WeakMap and WeakRef", "Symbol type",
            "generators and iterators", "Web Workers",
            "Service Workers and PWA", "design patterns (Module, Observer, Singleton)",
            "memory leaks", "garbage collection", "currying",
            "memoization", "debounce and throttle implementation",
            "AbortController", "Intersection Observer",
            "structured clone", "class private fields",
            "performance optimization techniques",
        ],
    },
    "Java": {
        "beginner": [
            "variables and data types", "operators", "if-else and switch",
            "for, while, do-while loops", "arrays", "strings and String methods",
            "methods and return types", "classes and objects basics",
            "constructors", "access modifiers (public, private, protected)",
            "this keyword", "static keyword", "Scanner for input",
            "type casting", "wrapper classes", "basic exception handling (try/catch)",
            "ArrayList basics", "for-each loop", "printing output (System.out.println)",
            "comments and naming conventions",
        ],
        "intermediate": [
            "inheritance", "polymorphism (overloading vs overriding)",
            "abstract classes", "interfaces", "encapsulation",
            "packages and imports", "exception hierarchy (checked vs unchecked)",
            "collections (List, Set, Map)", "HashMap vs TreeMap",
            "ArrayList vs LinkedList", "generics basics",
            "Comparable and Comparator", "file I/O",
            "lambda expressions", "Stream API basics",
            "enum types", "StringBuilder vs String",
            "inner classes", "Object class methods (equals, hashCode, toString)",
            "custom exceptions",
        ],
        "advanced": [
            "multithreading and concurrency", "synchronized and locks",
            "thread pools (ExecutorService)", "volatile and atomic variables",
            "JVM architecture and memory model", "garbage collection algorithms",
            "design patterns (Singleton, Factory, Observer, Strategy)",
            "SOLID principles", "dependency injection",
            "reflection API", "annotations (custom annotations)",
            "Stream API advanced (collectors, groupingBy)",
            "Optional class", "CompletableFuture",
            "JDBC and database connectivity", "JPA and Hibernate basics",
            "microservices concepts", "Java modules (JPMS)",
            "record and sealed classes", "pattern matching",
        ],
    },
    "Node.js": {
        "beginner": [
            "what is Node.js and why use it", "installing Node.js and npm",
            "running a JS file with Node", "require vs import",
            "package.json basics", "npm install and dependencies",
            "creating a basic HTTP server", "console methods",
            "file reading (fs.readFile)", "file writing (fs.writeFile)",
            "path module basics", "process.env",
            "callback functions in Node", "nodemon for auto-restart",
            "Express.js basics (creating a server)", "routes in Express (GET, POST)",
            "sending JSON responses", "request and response objects",
            "serving static files", "basic middleware concept",
        ],
        "intermediate": [
            "middleware in Express (custom and third-party)", "REST API design",
            "error handling middleware", "routing with Router()",
            "connecting to MongoDB (Mongoose)", "CRUD operations",
            "environment variables with dotenv", "CORS handling",
            "request validation", "async/await in routes",
            "JWT authentication", "password hashing (bcrypt)",
            "file uploads (multer)", "query parameters and body parsing",
            "MVC pattern in Node", "Mongoose schemas and models",
            "populate and references", "pagination",
            "rate limiting", "API testing with Postman",
        ],
        "advanced": [
            "event loop internals (libuv)", "streams and buffers",
            "cluster module and scaling", "Worker Threads",
            "microservices architecture", "message queues (RabbitMQ, Redis)",
            "WebSockets (Socket.io)", "GraphQL with Apollo",
            "caching with Redis", "database indexing and optimization",
            "Docker and containerization", "CI/CD pipelines",
            "PM2 process manager", "memory leak debugging",
            "security best practices (OWASP)", "serverless deployment",
            "logging (Winston)", "monitoring and health checks",
            "database migrations", "event-driven architecture",
        ],
    },
    "SQL": {
        "beginner": [
            "what is SQL and databases", "CREATE TABLE", "INSERT INTO",
            "SELECT and WHERE", "UPDATE and DELETE", "data types (INT, VARCHAR, DATE)",
            "PRIMARY KEY", "ORDER BY", "LIMIT",
            "DISTINCT keyword", "AND, OR, NOT operators",
            "LIKE and wildcards", "IN and BETWEEN",
            "COUNT, SUM, AVG", "MIN and MAX",
            "NULL values and IS NULL", "aliases (AS keyword)",
            "basic table design", "comments in SQL",
            "simple JOINs (INNER JOIN)",
        ],
        "intermediate": [
            "LEFT JOIN, RIGHT JOIN, FULL JOIN", "GROUP BY and HAVING",
            "subqueries", "aggregate functions with GROUP BY",
            "UNION and UNION ALL", "indexes and performance",
            "foreign keys and relationships", "normalization (1NF, 2NF, 3NF)",
            "CASE expressions", "string functions (CONCAT, UPPER, LOWER, TRIM)",
            "date functions", "views",
            "constraints (UNIQUE, CHECK, NOT NULL)", "ALTER TABLE",
            "INSERT with SELECT", "UPDATE with JOIN",
            "DELETE vs TRUNCATE", "self joins",
            "COALESCE and IFNULL", "EXISTS vs IN",
        ],
        "advanced": [
            "window functions (ROW_NUMBER, RANK, LAG, LEAD)",
            "CTEs (Common Table Expressions)", "recursive CTEs",
            "stored procedures", "triggers",
            "transactions and ACID properties", "isolation levels",
            "deadlocks", "query optimization and EXPLAIN",
            "materialized views", "partitioning",
            "replication and sharding", "database design patterns",
            "pivot and unpivot", "cursor usage",
            "dynamic SQL", "temp tables vs table variables",
            "SQL injection prevention", "backup and recovery",
            "performance tuning strategies",
        ],
    },
}

# Fallback
DEFAULT_TOPICS = {
    "beginner": [
        "basic syntax", "variables", "data types", "conditionals",
        "loops", "functions", "arrays/lists", "input/output",
        "error handling basics", "simple programs",
    ],
    "intermediate": [
        "OOP concepts", "file handling", "API usage",
        "error handling", "data structures", "algorithms basics",
        "modules/packages", "testing basics", "design patterns intro",
        "debugging techniques",
    ],
    "advanced": [
        "system design", "performance optimization", "concurrency",
        "security", "architecture patterns", "advanced algorithms",
        "memory management", "scalability", "monitoring",
        "deployment strategies",
    ],
}


# ─── Level config ───
LEVEL_GUIDELINES = {
    "beginner": {
        "description": "a BEGINNER who just started learning",
        "mcq_rules": "Simple concept-check question. Max 15 words. Test basic knowledge.",
        "desc_rules": "Simple explanation question. Max 20 words. Ask 'what is' or 'explain' type.",
        "max_tokens_mcq": 200,
        "max_tokens_desc": 60,
    },
    "intermediate": {
        "description": "an INTERMEDIATE developer who knows the basics",
        "mcq_rules": "Practical understanding question. Max 25 words. Can test subtle differences.",
        "desc_rules": "How/why question about practical usage. Max 30 words.",
        "max_tokens_mcq": 250,
        "max_tokens_desc": 100,
    },
    "advanced": {
        "description": "an ADVANCED developer with deep experience",
        "mcq_rules": "Deep concept question testing edge cases. Max 30 words.",
        "desc_rules": "Scenario or architecture question. Max 40 words.",
        "max_tokens_mcq": 300,
        "max_tokens_desc": 150,
    },
}


def get_shuffled_topics(skill: str, level: str, seed: int) -> list:
    """Get a randomly shuffled list of topics for a skill+level using the session seed."""
    skill_topics = TOPIC_POOLS.get(skill, DEFAULT_TOPICS)
    topics = skill_topics.get(level, skill_topics.get("beginner", DEFAULT_TOPICS["beginner"])).copy()
    rng = random.Random(seed)
    rng.shuffle(topics)
    return topics


def get_question_schedule(level: str, seed: int) -> list:
    """Generate a shuffled schedule of question types (mcq/descriptive) for a session."""
    config = {
        "beginner": {"total": 10, "mcq": 4, "desc": 6},
        "intermediate": {"total": 15, "mcq": 6, "desc": 9},
        "advanced": {"total": 20, "mcq": 8, "desc": 12},
    }
    c = config.get(level, config["beginner"])
    schedule = ["mcq"] * c["mcq"] + ["descriptive"] * c["desc"]
    rng = random.Random(seed + 42)  # Different seed offset for schedule shuffle
    rng.shuffle(schedule)
    return schedule


# ═══════════════════════════════════════════════════════════════
# MCQ QUESTION GENERATION
# ═══════════════════════════════════════════════════════════════

def generate_mcq_question(skill: str, level: str, asked_questions: list = None, question_number: int = 1, seed: int = None):
    """Generate an MCQ question with 4 options and correct answer."""
    if asked_questions is None:
        asked_questions = []
    if seed is None:
        seed = random.randint(1, 999999)

    topics = get_shuffled_topics(skill, level, seed)
    topic_index = (question_number - 1) % len(topics)
    current_topic = topics[topic_index]

    level_config = LEVEL_GUIDELINES.get(level, LEVEL_GUIDELINES["beginner"])
    asked = "\n".join(f"- {q}" for q in asked_questions) if asked_questions else "None"

    prompt = f"""Generate ONE multiple-choice question about {skill}.

Topic: {current_topic}
Level: {level} ({level_config["description"]})
Rule: {level_config["mcq_rules"]}

Already asked (don't repeat): {asked}

You MUST respond in this EXACT JSON format, nothing else:
{{"question": "your question here", "options": ["A. option1", "B. option2", "C. option3", "D. option4"], "correct": "A"}}

Rules:
- Question must be SHORT and CLEAR
- All 4 options must be plausible
- Only ONE correct answer
- correct field must be just the letter (A, B, C, or D)
- Return ONLY valid JSON, no extra text"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": f"You are a {skill} quiz generator. Return ONLY valid JSON. No markdown, no code blocks, no extra text."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=level_config["max_tokens_mcq"],
        seed=seed + question_number,
    )

    raw = response.choices[0].message.content.strip()
    return parse_mcq_response(raw, current_topic, skill)


def parse_mcq_response(raw: str, topic: str, skill: str) -> dict:
    """Parse the LLM MCQ response into structured data."""
    # Try to extract JSON from the response
    try:
        # Remove markdown code blocks if present
        cleaned = raw
        if "```" in cleaned:
            cleaned = re.sub(r'```(?:json)?\s*', '', cleaned)
            cleaned = cleaned.strip()
        
        data = json.loads(cleaned)
        
        # Validate structure
        if "question" in data and "options" in data and "correct" in data:
            # Ensure options are properly formatted
            options = data["options"]
            if len(options) == 4:
                # Clean up options - ensure they have A. B. C. D. prefix
                formatted_options = []
                letters = ["A", "B", "C", "D"]
                for i, opt in enumerate(options):
                    opt_text = opt.strip()
                    # Remove existing prefix if any
                    for prefix in ["A. ", "B. ", "C. ", "D. ", "A) ", "B) ", "C) ", "D) "]:
                        if opt_text.startswith(prefix):
                            opt_text = opt_text[len(prefix):]
                            break
                    formatted_options.append(f"{letters[i]}. {opt_text}")
                
                correct = data["correct"].strip().upper()
                if correct not in ["A", "B", "C", "D"]:
                    correct = "A"
                
                return {
                    "question": data["question"].strip(),
                    "options": formatted_options,
                    "correct": correct,
                }
    except (json.JSONDecodeError, KeyError, TypeError):
        pass

    # Fallback: generate a simple hardcoded MCQ
    return {
        "question": f"Which of the following is related to {topic} in {skill}?",
        "options": [
            f"A. Core concept of {topic}",
            f"B. Unrelated feature",
            f"C. Different programming concept",
            f"D. None of the above",
        ],
        "correct": "A",
    }


# ═══════════════════════════════════════════════════════════════
# DESCRIPTIVE QUESTION GENERATION
# ═══════════════════════════════════════════════════════════════

def generate_descriptive_question(skill: str, level: str, asked_questions: list = None, question_number: int = 1, seed: int = None):
    """Generate a descriptive/open-ended question."""
    if asked_questions is None:
        asked_questions = []
    if seed is None:
        seed = random.randint(1, 999999)

    topics = get_shuffled_topics(skill, level, seed)
    topic_index = (question_number - 1) % len(topics)
    current_topic = topics[topic_index]

    level_config = LEVEL_GUIDELINES.get(level, LEVEL_GUIDELINES["beginner"])
    asked = "\n".join(f"- {q}" for q in asked_questions) if asked_questions else "None"

    prompt = f"""Generate ONE short {skill} interview question.

Topic: {current_topic}
Level: {level} ({level_config["description"]})
Rule: {level_config["desc_rules"]}

Already asked (don't repeat): {asked}

Return ONLY the question. No numbering, no prefix, no extra text."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": f"You are a {skill} interviewer. Ask a SHORT, CLEAR question about '{current_topic}' for {level} level. Max 1-2 sentences."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=level_config["max_tokens_desc"],
        seed=seed + question_number,
    )

    result = response.choices[0].message.content.strip()
    result = result.strip('"').strip("'")
    for prefix in ["Question:", "Q:", "Question ", "Q "]:
        if result.startswith(prefix):
            result = result[len(prefix):].strip()
    return result


# ═══════════════════════════════════════════════════════════════
# ANSWER EVALUATION — MCQ (auto-check)
# ═══════════════════════════════════════════════════════════════

def evaluate_mcq(question: str, options: list, selected: str, correct: str, skill: str):
    """Evaluate an MCQ answer. Returns score and brief feedback."""
    is_correct = selected.upper() == correct.upper()
    score = 10 if is_correct else 0

    # Find the correct option text
    correct_option_text = ""
    selected_option_text = ""
    for opt in options:
        if opt.startswith(f"{correct}."):
            correct_option_text = opt
        if opt.startswith(f"{selected.upper()}."):
            selected_option_text = opt

    if is_correct:
        feedback = "Correct! Well done."
    else:
        feedback = f"Incorrect. The correct answer is {correct_option_text}."

    return {
        "score": score,
        "is_correct": is_correct,
        "feedback": feedback,
        "correct_answer": correct_option_text,
        "selected_answer": selected_option_text,
        "weak_areas": [] if is_correct else [question.split("?")[0].strip()[:50]],
        # Category scores for MCQ
        "technical_knowledge": 10 if is_correct else 2,
        "concept_understanding": 10 if is_correct else 2,
        "problem_solving": 10 if is_correct else 3,
        "communication": 10,  # N/A for MCQ, neutral
        "confidence": 10 if is_correct else 5,
        "clarity": 10,  # N/A for MCQ, neutral
    }


# ═══════════════════════════════════════════════════════════════
# ANSWER EVALUATION — DESCRIPTIVE (AI-powered)
# ═══════════════════════════════════════════════════════════════

def evaluate_descriptive_answer(question: str, answer: str, skill: str):
    """Evaluate a descriptive answer with 6 criteria."""
    prompt = f"""You are an expert {skill} interviewer evaluating a candidate's answer.

Question: {question}
Candidate's Answer: {answer}

Evaluate on these 6 criteria (score each 1-10):

Return in this EXACT format (one per line):
SCORE: [overall score 1-10]
TECHNICAL_KNOWLEDGE: [1-10]
CONCEPT_UNDERSTANDING: [1-10]
PROBLEM_SOLVING: [1-10]
COMMUNICATION: [1-10]
CONFIDENCE: [1-10]
CLARITY: [1-10]
FEEDBACK: [2-3 sentences of constructive feedback]
CORRECT_ANSWER: [ideal answer in 2-3 sentences]
WEAK_AREAS: [topics to improve, comma separated]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500,
    )
    return parse_descriptive_evaluation(response.choices[0].message.content.strip())


def parse_descriptive_evaluation(text: str) -> dict:
    """Parse the AI evaluation response into structured data."""
    lines = text.split('\n')
    result = {
        "score": 5,
        "technical_knowledge": 5,
        "concept_understanding": 5,
        "problem_solving": 5,
        "communication": 5,
        "confidence": 5,
        "clarity": 5,
        "feedback": "",
        "correct_answer": "",
        "weak_areas": [],
    }

    field_map = {
        "SCORE:": "score",
        "TECHNICAL_KNOWLEDGE:": "technical_knowledge",
        "CONCEPT_UNDERSTANDING:": "concept_understanding",
        "PROBLEM_SOLVING:": "problem_solving",
        "COMMUNICATION:": "communication",
        "CONFIDENCE:": "confidence",
        "CLARITY:": "clarity",
        "FEEDBACK:": "feedback",
        "CORRECT_ANSWER:": "correct_answer",
        "WEAK_AREAS:": "weak_areas",
    }

    for line in lines:
        line = line.strip()
        for prefix, key in field_map.items():
            if line.upper().startswith(prefix):
                value = line[len(prefix):].strip()
                if key in ["score", "technical_knowledge", "concept_understanding",
                           "problem_solving", "communication", "confidence", "clarity"]:
                    try:
                        result[key] = min(10, max(1, int(re.search(r'\d+', value).group())))
                    except:
                        result[key] = 5
                elif key == "weak_areas":
                    result[key] = [a.strip() for a in value.split(",") if a.strip()]
                else:
                    result[key] = value
                break

    return result


# ═══════════════════════════════════════════════════════════════
# FINAL REPORT GENERATION
# ═══════════════════════════════════════════════════════════════

def generate_final_report(answers: list, skill: str, level: str, user_name: str):
    """Generate a comprehensive final assessment report from all answers."""

    total_questions = len(answers)
    if total_questions == 0:
        return _empty_report(skill, level, user_name)

    # Calculate category averages from per-answer scores
    categories = {
        "technical_knowledge": [],
        "concept_understanding": [],
        "problem_solving": [],
        "communication": [],
        "confidence": [],
        "clarity": [],
    }

    all_scores = []
    all_weak_areas = []
    strong_topics = []
    weak_topics = []

    for a in answers:
        score = a.get("score", 0)
        all_scores.append(score)

        # Collect category scores
        for cat in categories:
            val = a.get(cat, 5)
            categories[cat].append(val)

        # Track weak areas
        for w in a.get("weak_areas", []):
            if w and w not in all_weak_areas:
                all_weak_areas.append(w)

        # Determine strong vs weak topics from the question
        q_topic = a.get("question", "")[:60]
        if score >= 7:
            strong_topics.append(q_topic)
        elif score <= 4:
            weak_topics.append(q_topic)

    # Calculate overall percentage
    max_possible = total_questions * 10
    total_scored = sum(all_scores)
    overall_percentage = round((total_scored / max_possible) * 100) if max_possible > 0 else 0

    # Calculate category percentages (out of 100)
    category_scores = {}
    for cat, values in categories.items():
        avg = sum(values) / len(values) if values else 5
        category_scores[cat] = round(avg * 10)  # Convert 1-10 to percentage

    # Build strengths list (top performing topics)
    strengths = []
    for a in answers:
        if a.get("score", 0) >= 8:
            q = a.get("question", "")
            if len(q) > 50:
                q = q[:50] + "..."
            strengths.append(q)
    strengths = strengths[:5]  # Max 5 strengths

    # Build areas to improve
    areas_to_improve = all_weak_areas[:5]  # Max 5

    # Build recommended topics using AI
    recommendations = _get_recommendations(skill, level, all_weak_areas)

    return {
        "user_name": user_name,
        "skill": skill,
        "level": level,
        "total_questions": total_questions,
        "total_score": total_scored,
        "overall_percentage": overall_percentage,
        "category_scores": category_scores,
        "strengths": strengths,
        "areas_to_improve": areas_to_improve,
        "recommended_topics": recommendations,
        "answers": answers,
    }


def _get_recommendations(skill: str, level: str, weak_areas: list) -> list:
    """Generate study recommendations based on weak areas."""
    if not weak_areas:
        return [f"Advanced {skill} concepts", "System design patterns", "Best practices and optimization"]

    weak_text = ", ".join(weak_areas[:5])
    prompt = f"""Based on a {level} level {skill} interview, the candidate struggled with: {weak_text}

Suggest 4-5 specific topics they should study to improve. Return ONLY a JSON array of strings like:
["Topic 1", "Topic 2", "Topic 3", "Topic 4"]

No extra text, just the JSON array."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=150,
        )
        raw = response.choices[0].message.content.strip()
        # Try to parse JSON array
        if "```" in raw:
            raw = re.sub(r'```(?:json)?\s*', '', raw).strip()
        topics = json.loads(raw)
        if isinstance(topics, list):
            return topics[:5]
    except:
        pass

    # Fallback
    return weak_areas[:4] + [f"{skill} fundamentals review"]


def _empty_report(skill, level, user_name):
    """Return an empty report structure."""
    return {
        "user_name": user_name,
        "skill": skill,
        "level": level,
        "total_questions": 0,
        "total_score": 0,
        "overall_percentage": 0,
        "category_scores": {
            "technical_knowledge": 0,
            "concept_understanding": 0,
            "problem_solving": 0,
            "communication": 0,
            "confidence": 0,
            "clarity": 0,
        },
        "strengths": [],
        "areas_to_improve": [],
        "recommended_topics": [],
        "answers": [],
    }