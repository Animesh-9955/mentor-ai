import os
import json
import httpx
import random
from typing import Dict, Any, List

# Curated Local library fallback (so the app works offline seamlessly)
curated_content_db = {
    "binary search": {
        "roadmap": [
            {"id": "bs_1", "title": "Prerequisites & Sorting", "status": "completed", "type": "intro"},
            {"id": "bs_2", "title": "The Divide & Conquer Strategy", "status": "active", "type": "concept"},
            {"id": "bs_3", "title": "Pointer Math & Mid-Calculations", "status": "locked", "type": "math"},
            {"id": "bs_4", "title": "Interactive Coding (JS/Py)", "status": "locked", "type": "code"},
            {"id": "bs_5", "title": "Boss Assessment: Binary Behemoth", "status": "locked", "type": "boss"}
        ],
        "markdown": """# Master Binary Search (Divide & Conquer)

Binary Search is an **$O(\\log n)$** search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array.

## How It Works
1. **Pointers**: Initialize `low = 0` and `high = array.length - 1`.
2. **Loop**: While `low <= high`:
   * Calculate mid: `mid = low + Math.floor((high - low) / 2)`.
   * If `array[mid] === target`, return `mid`.
   * If `array[mid] < target`, set `low = mid + 1`.
   * If `array[mid] > target`, set `high = mid - 1`.
3. **Not Found**: Return `-1`.

> **Why `low + Math.floor((high - low) / 2)`?** 
> To prevent integer overflow in languages like C/C++/Java where standard `(low + high) / 2` can exceed integer limits!

### Complexity Analysis
* **Time Complexity**: $O(\\log n)$ average and worst case.
* **Space Complexity**: $O(1)$ auxiliary for iterative version.""",
        "whiteboard": [
            {"type": "node", "text": "Array: [2, 5, 8, 12, 16, 23, 38]"},
            {"type": "arrow"},
            {"type": "node", "text": "Target: 23"},
            {"type": "arrow"},
            {"type": "node", "text": "Mid: Index 3 (Value: 12)"},
            {"type": "arrow"},
            {"type": "node", "text": "12 < 23 → Search Right Segment [16, 23, 38]"}
        ],
        "slides": [
            {"title": "Binary Search Essentials", "bullet1": "Only works on pre-sorted arrays", "bullet2": "Eliminates half the searching space each step", "bullet3": "Achieves logarithmic scale $O(\\log n)$"},
            {"title": "Visual Example", "bullet1": "Let Array = [10, 20, 30, 40, 50], target = 40", "bullet2": "Step 1: low=0, high=4, mid=2 (Val: 30)", "bullet3": "Step 2: 30 < 40, shift low to mid+1 (index 3)"},
            {"title": "Implementation Pitfalls", "bullet1": "Midpoint overflow bug", "bullet2": "Off-by-one errors in while conditions (`low <= high`)", "bullet3": "Infinite loop when pointers fail to progress"}
        ],
        "quiz": [
            {
                "text": "What is the time complexity of searching in a sorted array of size N using Binary Search?",
                "code": "",
                "options": ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
                "answer": 1,
                "hint": "Think about how many elements are remaining at each comparison. We divide the search space by half."
            },
            {
                "text": "Which index computation avoids potential integer overflow bugs in programming languages like C++?",
                "code": "int low = 0, high = arr.length - 1;",
                "options": [
                    "int mid = (low + high) / 2;",
                    "int mid = low + (high - low) / 2;",
                    "int mid = high - (low + high) / 2;",
                    "int mid = low * 2 + high / 2;"
                ],
                "answer": 1,
                "hint": "We want to compute the difference between high and low, halve it, and add it back to low."
            },
            {
                "text": "What pre-condition is strictly required for Binary Search to behave correctly?",
                "code": "",
                "options": [
                    "The list must contain only numerical entries.",
                    "The elements must be ordered in ascending or descending sort sequence.",
                    "The size of the collection must be a power of two.",
                    "The list must be stored in a linked data structure."
                ],
                "answer": 1,
                "hint": "Without this order, we cannot guarantee whether the target lies in the left or right subsegment."
            },
            {
                "text": "Which approach is equivalent to Binary Search but formulated using call stacks?",
                "code": "",
                "options": [
                    "Iterative pointer updates loop",
                    "Recursive divide and conquer helper",
                    "Breadth first level search",
                    "Tabulated dynamic array updates"
                ],
                "answer": 1,
                "hint": "Think about functions calling themselves to split search ranges."
            },
            {
                "text": "If we perform binary search on an array of 1000 sorted elements, what is the maximum number of comparisons needed?",
                "code": "",
                "options": ["1000 comparisons", "500 comparisons", "10 comparisons", "1 comparison"],
                "answer": 2,
                "hint": "Log base 2 of 1000 is approximately 10."
            }
        ]
    }
}

def generate_procedural_fallback(topic: str) -> Dict[str, Any]:
    return {
        "roadmap": [
            {"id": "p_1", "title": f"Core Basics of {topic}", "status": "completed", "type": "intro"},
            {"id": "p_2", "title": "Main Concepts & Models", "status": "active", "type": "concept"},
            {"id": "p_3", "title": "Advanced Applications", "status": "locked", "type": "math"},
            {"id": "p_4", "title": f"Boss Assessment: {topic} Master", "status": "locked", "type": "boss"}
        ],
        "markdown": f"""# Mastery Study Notes: {topic}

This is a dynamic, customized learning plan generated by **MentorAI** for your study target: **{topic}**.

## Key Concepts
* **Definition**: The fundamental architecture and mechanisms driving {topic}.
* **Application**: Used heavily in modern development ecosystems, competitive exams, and interview loops.
* **Important Rule**: Ensure you validate all constraints and boundary conditions.

## Sample Implementation
```javascript
// Demonstration of {topic}
function demo() {{
  console.log("Learning path initiated for: {topic}");
  return true;
}}
demo();
```
""",
        "whiteboard": [
            {"type": "node", "text": f"{topic} input layer"},
            {"type": "arrow"},
            {"type": "node", "text": "Core processing and constraints verification"},
            {"type": "arrow"},
            {"type": "node", "text": "Evaluated Output Node"}
        ],
        "slides": [
            {"title": f"Mastering {topic}", "bullet1": "Understand constraints and boundary items first", "bullet2": "Implement efficient iterations or models", "bullet3": "Optimize runtime complexity and memory footprint"}
        ],
        "quiz": [
            {
                "text": f"Which architectural pattern is most standard when implementing {topic}?",
                "code": f"let activeElement = '{topic}';",
                "options": [
                    "Linear iterative traversal",
                    "Divide and conquer logic",
                    "Random walk hashing",
                    "Sub-graph partition search"
                ],
                "answer": 1,
                "hint": "Divide and conquer splits the problem set to improve logarithmic latency bounds."
            },
            {
                "text": f"What is the primary optimization goal when deploying {topic} in production?",
                "code": "",
                "options": [
                    "Increasing code complexity bounds",
                    "Minimizing resource latency and memory leaks",
                    "Maximizing terminal console print counts",
                    "Disabling connection cache pool indexes"
                ],
                "answer": 1,
                "hint": "Production efficiency demands minimizing resource consumption metrics."
            },
            {
                "text": f"Which verification strategy is most critical for validating {topic} components?",
                "code": "",
                "options": [
                    "Ignoring boundary limits and edge exceptions",
                    "Validating extreme input bounds and null pointer states",
                    "Relying purely on manual page refreshes",
                    "Deleting assert triggers from test packages"
                ],
                "answer": 1,
                "hint": "Null pointer values and numeric limits represent standard fault coordinates."
            },
            {
                "text": f"When updating state loops for {topic}, what logic error must developers prevent?",
                "code": "",
                "options": [
                    "Infinite execution freeze / stack overflow",
                    "Inline documentation comment updates",
                    "Import statement reuse patterns",
                    "Centralized method signature adjustments"
                ],
                "answer": 0,
                "hint": "Unbounded iteration loops trigger hardware freeze or stack overflow faults."
            },
            {
                "text": f"Which database engine design is ideal for storing metadata related to {topic}?",
                "code": "",
                "options": [
                    "A plain unindexed text log structure",
                    "Relational table indexing or structured document models",
                    "Randomly distributed cache segments without keys",
                    "Temporary memory blocks inside function frames"
                ],
                "answer": 1,
                "hint": "Relational indexes and document schemas provide fast data lookups."
            }
        ]
    }

async def call_gemini_api(api_key: str, prompt: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    async with httpx.AsyncClient(timeout=35.0) as client:
        response = await client.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]}
        )
        if response.status_code != 200:
            raise Exception(f"Gemini API status code: {response.status_code}. Response: {response.text}")
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

async def call_grok_api(api_key: str, prompt: str) -> str:
    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=35.0) as client:
        response = await client.post(
            url,
            headers=headers,
            json={
                "model": "grok-2",
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        if response.status_code != 200:
            raise Exception(f"Grok API status code: {response.status_code}. Response: {response.text}")
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_openai_api(api_key: str, prompt: str) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient(timeout=35.0) as client:
        response = await client.post(
            url,
            headers=headers,
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        if response.status_code != 200:
            raise Exception(f"OpenAI API status code: {response.status_code}. Response: {response.text}")
        data = response.json()
        return data["choices"][0]["message"]["content"]

def get_api_key_pool(env_list_var: str, fallback_var: str = None) -> List[str]:
    raw = os.getenv(env_list_var, "")
    keys = [k.strip() for k in raw.split(",") if k.strip()]
    if not keys and fallback_var:
        fb = os.getenv(fallback_var, "")
        if fb:
            keys = [fb.strip()]
    return keys

async def query_llm_chain(topic: str, mode: str, client_keys: Dict[str, str] = None) -> Dict[str, Any]:
    # Strict formatting prompt template
    prompt = f"""
    You are MentorAI, an expert gamified AI tutor that helps students learn until they understand.
    Generate a full structured curriculum lesson for the topic: "{topic}" under the learning style: "{mode}".
    
    CRITICAL INSTRUCTION: You MUST generate EXACTLY 5 distinct multiple-choice questions in the "quiz" array list representing a variety of difficulty ranges (from conceptual basics to advanced application).
    
    You MUST respond with a strict, valid JSON object matching the following structure. Do NOT wrap your response in markdown code blocks or add any trailing explanation text. Just output the raw JSON object. Do not include comments (like //) in the JSON payload.
    
    {{
      "roadmap": [
        {{"id": "node_1", "title": "Introduction to {topic}", "status": "completed", "type": "intro"}},
        {{"id": "node_2", "title": "Core Concept of {topic}", "status": "active", "type": "concept"}},
        {{"id": "node_3", "title": "Subtopic Details", "status": "locked", "type": "math"}},
        {{"id": "node_4", "title": "Boss Assessment Fight", "status": "locked", "type": "boss"}}
      ],
      "markdown": "# Detailed Lesson Notes on {topic}\\n\\nIntroduce the topic, explain prerequisites, define main formulas, and supply clean code samples or diagrams.",
      "whiteboard": [
        {{"type": "node", "text": "Input: {topic}"}},
        {{"type": "arrow"}},
        {{"type": "node", "text": "Evaluation Node"}}
      ],
      "slides": [
        {{"title": "Core slide", "bullet1": "Highlight point 1", "bullet2": "Highlight point 2", "bullet3": "Highlight point 3"}}
      ],
      "quiz": [
        {{
          "text": "Quiz question 1?",
          "code": "optional code snippet or empty string",
          "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
          "answer": 0,
          "hint": "Hint for question 1"
        }},
        {{
          "text": "Quiz question 2?",
          "code": "optional code snippet or empty string",
          "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
          "answer": 1,
          "hint": "Hint for question 2"
        }},
        {{
          "text": "Quiz question 3?",
          "code": "optional code snippet or empty string",
          "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
          "answer": 2,
          "hint": "Hint for question 3"
        }},
        {{
          "text": "Quiz question 4?",
          "code": "optional code snippet or empty string",
          "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
          "answer": 3,
          "hint": "Hint for question 4"
        }},
        {{
          "text": "Quiz question 5?",
          "code": "optional code snippet or empty string",
          "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
          "answer": 0,
          "hint": "Hint for question 5"
        }}
      ]
    }}
    """
    
    # 1. Build key pools
    gemini_keys = get_api_key_pool("GEMINI_API_KEYS", "GEMINI_API_KEY")
    grok_keys = get_api_key_pool("GROK_API_KEYS", "GROK_API_KEY")
    openai_keys = get_api_key_pool("OPENAI_API_KEYS", "OPENAI_API_KEY")
    
    # 2. Try Gemini keys in rotation pool
    if gemini_keys:
        for idx, key in enumerate(gemini_keys):
            try:
                print(f"[Router] Querying Gemini (Key Index {idx+1}/{len(gemini_keys)})...", flush=True)
                raw_text = await call_gemini_api(key, prompt)
                return parse_json_from_llm(raw_text)
            except Exception as e:
                print(f"[Router] Gemini Key {idx+1} failed: {str(e)}.", flush=True)
                
    # 3. Try Grok keys in rotation pool
    if grok_keys:
        for idx, key in enumerate(grok_keys):
            try:
                print(f"[Router] Querying Grok (Key Index {idx+1}/{len(grok_keys)})...", flush=True)
                raw_text = await call_grok_api(key, prompt)
                return parse_json_from_llm(raw_text)
            except Exception as e:
                print(f"[Router] Grok Key {idx+1} failed: {str(e)}.", flush=True)
                
    # 4. Try OpenAI keys in rotation pool
    if openai_keys:
        for idx, key in enumerate(openai_keys):
            try:
                print(f"[Router] Querying OpenAI (Key Index {idx+1}/{len(openai_keys)})...", flush=True)
                raw_text = await call_openai_api(key, prompt)
                return parse_json_from_llm(raw_text)
            except Exception as e:
                print(f"[Router] OpenAI Key {idx+1} failed: {str(e)}.", flush=True)

    # 5. Local cached database fallback
    clean_topic = topic.lower().strip()
    if clean_topic in curated_content_db:
        print("[Router] All API keys failed or unconfigured. Serving curated local fallback...", flush=True)
        return curated_content_db[clean_topic]
        
    # 6. Procedural generator final fallback
    print("[Router] All API keys failed or unconfigured. Serving procedural fallback...", flush=True)
    return generate_procedural_fallback(topic)

def parse_json_from_llm(text: str) -> Dict[str, Any]:
    clean_text = text.strip()
    if clean_text.startswith("```json"):
        clean_text = clean_text[7:]
    elif clean_text.startswith("```"):
        clean_text = clean_text[3:]
    if clean_text.endswith("```"):
        clean_text = clean_text[:-3]
    clean_text = clean_text.strip()
    return json.loads(clean_text)
