import os
import json
import time
import asyncio
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
import httpx
from backend.app.domain.interfaces import AIProvider
from backend.app.infrastructure.config import settings

logger = logging.getLogger(__name__)

# Base Helper for Usage Tracking across Providers
class ProviderUsageTracker:
    def __init__(self, provider_name: str):
        self.provider_name = provider_name
        self.total_calls = 0
        self.successful_calls = 0
        self.failed_calls = 0
        self.prompt_tokens_estimated = 0
        self.completion_tokens_estimated = 0
        self.total_latency_ms = 0.0

    def estimate_tokens(self, text: str) -> int:
        """Rough token estimation (4 chars ~ 1 token)."""
        return max(1, len(text) // 4)

    def record_success(self, prompt_text: str, response_text: str, latency_ms: float):
        self.total_calls += 1
        self.successful_calls += 1
        self.prompt_tokens_estimated += self.estimate_tokens(prompt_text)
        self.completion_tokens_estimated += self.estimate_tokens(response_text)
        self.total_latency_ms += latency_ms

    def record_failure(self, prompt_text: str, latency_ms: float):
        self.total_calls += 1
        self.failed_calls += 1
        self.prompt_tokens_estimated += self.estimate_tokens(prompt_text)
        self.total_latency_ms += latency_ms

    def get_metrics(self) -> Dict[str, Any]:
        avg_latency = (self.total_latency_ms / self.total_calls) if self.total_calls > 0 else 0.0
        success_rate = (self.successful_calls / self.total_calls * 100) if self.total_calls > 0 else 100.0
        return {
            "provider": self.provider_name,
            "total_calls": self.total_calls,
            "successful_calls": self.successful_calls,
            "failed_calls": self.failed_calls,
            "success_rate_percent": round(success_rate, 2),
            "estimated_prompt_tokens": self.prompt_tokens_estimated,
            "estimated_completion_tokens": self.completion_tokens_estimated,
            "estimated_total_tokens": self.prompt_tokens_estimated + self.completion_tokens_estimated,
            "avg_latency_ms": round(avg_latency, 2)
        }


# =====================================================================
# 1. Gemini Provider Implementation
# =====================================================================
class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        self.stream_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent"
        self.tracker = ProviderUsageTracker("Gemini")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set.")

        start_time = time.time()
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature}
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.url}?key={self.api_key}", json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(prompt, latency_ms)
                logger.error(f"[Gemini] API Error ({response.status_code}): {response.text[:200]}")
                raise Exception(f"Gemini API returned error ({response.status_code}): {response.text[:200]}")

            result = response.json()
            try:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                self.tracker.record_success(prompt, text, latency_ms)
                logger.info(f"[Gemini] Generated {len(text)} chars in {latency_ms:.1f}ms")
                return text
            except (KeyError, IndexError):
                self.tracker.record_failure(prompt, latency_ms)
                logger.error(f"[Gemini] Unexpected response structure: {result}")
                raise Exception("Failed to extract text from Gemini response")

    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set.")

        start_time = time.time()
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json"
            }
        }
        schema_desc = f"\n\nRespond ONLY with a JSON object that satisfies this structure:\n{schema}"
        payload["contents"][0]["parts"][0]["text"] += schema_desc

        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.url}?key={self.api_key}", json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(prompt, latency_ms)
                logger.error(f"[Gemini] API Error ({response.status_code}): {response.text[:200]}")
                raise Exception(f"Gemini API returned error: {response.text[:200]}")

            result = response.json()
            try:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                data = json.loads(text.strip())
                self.tracker.record_success(prompt, text, latency_ms)
                logger.info(f"[Gemini] Generated JSON response in {latency_ms:.1f}ms")
                return data
            except (KeyError, IndexError, json.JSONDecodeError) as e:
                self.tracker.record_failure(prompt, latency_ms)
                logger.error(f"[Gemini] JSON parse error: {e}. Raw response: {result}")
                raise Exception("Failed to generate valid JSON from Gemini")

    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        contents = []
        for msg in messages:
            role = msg["role"]
            if role == "assistant":
                role = "model"
            elif role == "system":
                continue
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })

        start_time = time.time()
        payload = {
            "contents": contents,
            "generationConfig": {"temperature": temperature}
        }

        sys_instr = system_instruction
        if not sys_instr:
            system_msgs = [m["content"] for m in messages if m["role"] == "system"]
            if system_msgs:
                sys_instr = system_msgs[-1]

        if sys_instr:
            payload["systemInstruction"] = {"parts": [{"text": sys_instr}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.url}?key={self.api_key}", json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(str(messages), latency_ms)
                logger.error(f"[Gemini] Chat API Error: {response.text[:200]}")
                raise Exception(f"Gemini API returned error: {response.text[:200]}")

            result = response.json()
            try:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                self.tracker.record_success(str(messages), text, latency_ms)
                return text
            except (KeyError, IndexError):
                self.tracker.record_failure(str(messages), latency_ms)
                raise Exception("Failed to extract chat text from Gemini response")

    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Stream chunks asynchronously from Gemini."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set.")

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature}
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{self.stream_url}?key={self.api_key}&alt=sse", json=payload) as response:
                if response.status_code != 200:
                    raise Exception(f"Gemini Streaming Error ({response.status_code})")
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk_json = json.loads(data_str)
                            text_chunk = chunk_json["candidates"][0]["content"]["parts"][0]["text"]
                            yield text_chunk
                        except Exception:
                            continue

    async def generate_embedding(self, text: str) -> List[float]:
        if not self.api_key:
            return await self._local_hash_vector(text)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={self.api_key}"
        payload = {
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text}]}
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    result = response.json()
                    return result["embedding"]["values"]
        except Exception as e:
            logger.warning(f"[Gemini] Embedding API exception: {e}. Using local hash fallback.")
        return await self._local_hash_vector(text)

    async def _local_hash_vector(self, text: str) -> List[float]:
        vector = [0.0] * 768
        for char in text:
            vector[ord(char) % 768] += 1.0
        magnitude = sum([v**2 for v in vector])**0.5
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    def get_usage_metrics(self) -> Dict[str, Any]:
        return self.tracker.get_metrics()


# =====================================================================
# 2. Groq Provider Implementation
# =====================================================================
class GroqProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile"
        self.tracker = ProviderUsageTracker("Groq")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        return await self._call_api(messages, temperature, is_json=False, prompt_text=prompt)

    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        messages = []
        sys_inst = system_instruction or "You are a helpful assistant."
        sys_inst += f"\n\nRespond ONLY with a JSON object conforming to this schema:\n{schema}"

        messages.append({"role": "system", "content": sys_inst})
        messages.append({"role": "user", "content": prompt})

        raw_json = await self._call_api(messages, temperature, is_json=True, prompt_text=prompt)
        return json.loads(raw_json.strip())

    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        formatted_msgs = []
        if system_instruction:
            formatted_msgs.append({"role": "system", "content": system_instruction})
        formatted_msgs.extend(messages)

        return await self._call_api(formatted_msgs, temperature, is_json=False, prompt_text=str(messages))

    async def _call_api(self, messages: List[Dict[str, str]], temperature: float, is_json: bool, prompt_text: str = "") -> str:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }
        if is_json:
            payload["response_format"] = {"type": "json_object"}

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.url, headers=headers, json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(prompt_text, latency_ms)
                logger.error(f"[Groq] API Error ({response.status_code}): {response.text[:200]}")
                raise Exception(f"Groq API returned error ({response.status_code}): {response.text[:200]}")

            result = response.json()
            res_text = result["choices"][0]["message"]["content"]
            self.tracker.record_success(prompt_text, res_text, latency_ms)
            logger.info(f"[Groq] Response generated in {latency_ms:.1f}ms")
            return res_text

    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", self.url, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    raise Exception(f"Groq Stream Error ({response.status_code})")
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk_json = json.loads(data_str)
                            delta = chunk_json["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue

    async def generate_embedding(self, text: str) -> List[float]:
        vector = [0.0] * 768
        for char in text:
            vector[ord(char) % 768] += 1.0
        magnitude = sum([v**2 for v in vector])**0.5
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    def get_usage_metrics(self) -> Dict[str, Any]:
        return self.tracker.get_metrics()


# =====================================================================
# 3. OpenRouter Provider Implementation
# =====================================================================
class OpenRouterProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "meta-llama/llama-3.1-70b-instruct"
        self.tracker = ProviderUsageTracker("OpenRouter")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        return await self._call_api(messages, temperature, is_json=False, prompt_text=prompt)

    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        messages = []
        sys_inst = system_instruction or "You are a helpful assistant."
        sys_inst += f"\n\nRespond ONLY with a JSON object conforming to this schema:\n{schema}"

        messages.append({"role": "system", "content": sys_inst})
        messages.append({"role": "user", "content": prompt})

        raw_json = await self._call_api(messages, temperature, is_json=True, prompt_text=prompt)
        return json.loads(raw_json.strip())

    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        formatted_msgs = []
        if system_instruction:
            formatted_msgs.append({"role": "system", "content": system_instruction})
        formatted_msgs.extend(messages)

        return await self._call_api(formatted_msgs, temperature, is_json=False, prompt_text=str(messages))

    async def _call_api(self, messages: List[Dict[str, str]], temperature: float, is_json: bool, prompt_text: str = "") -> str:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not set.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://github.com/musa-abubakar/resume-builder",
            "X-Title": "AI Career Assistant Nigeria",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature
        }
        if is_json:
            payload["response_format"] = {"type": "json_object"}

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.url, headers=headers, json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(prompt_text, latency_ms)
                logger.error(f"[OpenRouter] API Error ({response.status_code}): {response.text[:200]}")
                raise Exception(f"OpenRouter API returned error ({response.status_code}): {response.text[:200]}")

            result = response.json()
            res_text = result["choices"][0]["message"]["content"]
            self.tracker.record_success(prompt_text, res_text, latency_ms)
            return res_text

    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not set.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", self.url, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    raise Exception(f"OpenRouter Stream Error ({response.status_code})")
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk_json = json.loads(data_str)
                            delta = chunk_json["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue

    async def generate_embedding(self, text: str) -> List[float]:
        vector = [0.0] * 768
        for char in text:
            vector[ord(char) % 768] += 1.0
        magnitude = sum([v**2 for v in vector])**0.5
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    def get_usage_metrics(self) -> Dict[str, Any]:
        return self.tracker.get_metrics()


# =====================================================================
# 4. Vertex AI Provider Implementation
# =====================================================================
class VertexAIProvider(AIProvider):
    def __init__(self, project_id: str, location: str):
        self.project_id = project_id
        self.location = location
        self.model_id = "gemini-2.5-flash"
        self.tracker = ProviderUsageTracker("VertexAI")

    def _get_access_token(self) -> str:
        try:
            import google.auth
            import google.auth.transport.requests
            credentials, project = google.auth.default(
                scopes=['https://www.googleapis.com/auth/cloud-platform']
            )
            auth_req = google.auth.transport.requests.Request()
            credentials.refresh(auth_req)
            return credentials.token
        except Exception as e:
            token = os.getenv("VERTEX_ACCESS_TOKEN", "")
            if token:
                return token
            logger.error(f"[VertexAI] Auth failed: {e}")
            raise Exception("Vertex AI Authentication failed. Ensure GCP ADC or credentials are set.")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        token = self._get_access_token()
        url = f"https://{self.location}-aiplatform.googleapis.com/v1/projects/{self.project_id}/locations/{self.location}/publishers/google/models/{self.model_id}:generateContent"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature}
        }
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(prompt, latency_ms)
                logger.error(f"[VertexAI] API Error: {response.text[:200]}")
                raise Exception(f"Vertex AI API returned error: {response.text[:200]}")

            result = response.json()
            try:
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                self.tracker.record_success(prompt, text, latency_ms)
                return text
            except (KeyError, IndexError):
                self.tracker.record_failure(prompt, latency_ms)
                raise Exception("Failed to extract text from Vertex AI response")

    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        token = self._get_access_token()
        url = f"https://{self.location}-aiplatform.googleapis.com/v1/projects/{self.project_id}/locations/{self.location}/publishers/google/models/{self.model_id}:generateContent"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json"
            }
        }
        schema_desc = f"\n\nRespond ONLY with a JSON object conforming to this structure:\n{schema}"
        payload["contents"][0]["parts"][0]["text"] += schema_desc

        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(prompt, latency_ms)
                raise Exception(f"Vertex AI returned error: {response.text[:200]}")

            result = response.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            self.tracker.record_success(prompt, text, latency_ms)
            return json.loads(text.strip())

    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        token = self._get_access_token()
        url = f"https://{self.location}-aiplatform.googleapis.com/v1/projects/{self.project_id}/locations/{self.location}/publishers/google/models/{self.model_id}:generateContent"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        contents = []
        for msg in messages:
            role = msg["role"]
            if role == "assistant":
                role = "model"
            elif role == "system":
                continue
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        payload = {
            "contents": contents,
            "generationConfig": {"temperature": temperature}
        }

        sys_instr = system_instruction
        if sys_instr:
            payload["systemInstruction"] = {"parts": [{"text": sys_instr}]}

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code != 200:
                self.tracker.record_failure(str(messages), latency_ms)
                raise Exception(f"Vertex AI returned error: {response.text[:200]}")

            result = response.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            self.tracker.record_success(str(messages), text, latency_ms)
            return text

    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        # Simple non-blocking chunk stream fallback
        full_text = await self.generate_text(prompt, system_instruction, temperature)
        words = full_text.split(" ")
        for i in range(0, len(words), 5):
            chunk = " ".join(words[i:i+5]) + " "
            yield chunk
            await asyncio.sleep(0.05)

    async def generate_embedding(self, text: str) -> List[float]:
        vector = [0.0] * 768
        for char in text:
            vector[ord(char) % 768] += 1.0
        magnitude = sum([v**2 for v in vector])**0.5
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    def get_usage_metrics(self) -> Dict[str, Any]:
        return self.tracker.get_metrics()


# =====================================================================
# 5. Mock AI Provider Implementation
# =====================================================================
class MockAIProvider(AIProvider):
    def __init__(self):
        self.tracker = ProviderUsageTracker("MockAI")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        self.tracker.record_success(prompt, "Mock text", 10.0)
        return f"Mock response for prompt: {prompt[:40]}..."

    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        self.tracker.record_success(prompt, "Mock JSON", 10.0)
        return {
            "mocked": True,
            "message": "This is a mocked JSON response",
            "ats_score": 82,
            "score_breakdown": {"grammar": 85, "formatting": 80, "keyword": 78, "impact": 82, "skills": 85},
            "detailed_analysis": {
                "readability": "Good",
                "achievements": ["Increased user retention by 25%"],
                "action_verbs": ["Led", "Architected", "Engineered"],
                "weak_bullet_points": [],
                "missing_keywords": ["FastAPI", "PostgreSQL"],
                "missing_skills": ["Docker"],
                "red_flags": [],
                "recommendations": ["Add GitHub link", "Highlight NYSC details"]
            },
            "parsed_profile": {
                "name": "Nigerian Candidate",
                "email": "candidate@example.com",
                "skills": ["Python", "React", "SQL"]
            }
        }

    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        last_msg = messages[-1]["content"] if messages else ""
        self.tracker.record_success(last_msg, "Mock Chat", 10.0)
        return f"Mock interview response to: '{last_msg}'."

    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        sample = f"Mock streaming response for prompt: {prompt[:30]}... Completed successfully."
        words = sample.split(" ")
        for word in words:
            yield word + " "
            await asyncio.sleep(0.04)

    async def generate_embedding(self, text: str) -> List[float]:
        vector = [0.0] * 768
        for char in text:
            vector[ord(char) % 768] += 1.0
        magnitude = sum([v**2 for v in vector])**0.5
        if magnitude > 0:
            vector = [v / magnitude for v in vector]
        return vector

    def get_usage_metrics(self) -> Dict[str, Any]:
        return self.tracker.get_metrics()


# =====================================================================
# 6. Resilient AI Provider Manager (Orchestrator with Retries, Logging, Fallback)
# =====================================================================
class ResilientAIProviderManager(AIProvider):
    """
    Orchestrated Proxy Provider implementing:
    - Retries with exponential backoff (e.g. 3 attempts with 1s, 2s backoff)
    - Automatic Fallback strategy across configured providers (Gemini -> Groq -> OpenRouter -> Vertex -> Mock)
    - Detailed Telemetry Logging & Real-time Usage Metrics tracking
    - Async Streaming Support with Fallback
    """
    def __init__(self, primary_provider_name: str = "gemini", fallback_order: Optional[List[str]] = None, max_retries_per_provider: int = 2):
        self.primary_provider_name = primary_provider_name
        self.fallback_order = fallback_order or ["gemini", "groq", "openrouter", "vertex", "mock"]
        self.max_retries = max_retries_per_provider
        self.providers: Dict[str, AIProvider] = {}
        self._init_providers()

    def _init_providers(self):
        # Gemini
        if settings.GEMINI_API_KEY:
            self.providers["gemini"] = GeminiProvider(api_key=settings.GEMINI_API_KEY)
        # Groq
        if settings.GROQ_API_KEY:
            self.providers["groq"] = GroqProvider(api_key=settings.GROQ_API_KEY)
        # OpenRouter
        if settings.OPENROUTER_API_KEY:
            self.providers["openrouter"] = OpenRouterProvider(api_key=settings.OPENROUTER_API_KEY)
        # Vertex
        if settings.VERTEX_PROJECT_ID:
            self.providers["vertex"] = VertexAIProvider(project_id=settings.VERTEX_PROJECT_ID, location=settings.VERTEX_LOCATION)
        # Always available fallback
        self.providers["mock"] = MockAIProvider()

    def _get_execution_chain(self) -> List[tuple[str, AIProvider]]:
        """Build execution chain starting with primary provider followed by fallback order."""
        chain = []
        # First priority: configured primary provider if available
        if self.primary_provider_name in self.providers:
            chain.append((self.primary_provider_name, self.providers[self.primary_provider_name]))

        # Append remaining fallback order
        for name in self.fallback_order:
            if name in self.providers and (name, self.providers[name]) not in chain:
                chain.append((name, self.providers[name]))

        # Ensure Mock is always at the end as ultimate safety net
        if ("mock", self.providers["mock"]) not in chain:
            chain.append(("mock", self.providers["mock"]))

        return chain

    async def _execute_with_resilience(self, action_name: str, fn, *args, **kwargs) -> Any:
        """Executes an action across providers with retries, logging, and fallback."""
        chain = self._get_execution_chain()
        last_exception = None

        for name, provider in chain:
            for attempt in range(1, self.max_retries + 2):
                try:
                    logger.info(f"[ResilientAI] Executing {action_name} via '{name}' (Attempt {attempt})")
                    bound_fn = getattr(provider, fn)
                    result = await bound_fn(*args, **kwargs)
                    logger.info(f"[ResilientAI] {action_name} SUCCEEDED via '{name}'")
                    return result
                except Exception as e:
                    last_exception = e
                    logger.warning(f"[ResilientAI] {action_name} failed on '{name}' (Attempt {attempt}): {e}")
                    if attempt <= self.max_retries:
                        backoff = 0.5 * (2 ** (attempt - 1))
                        await asyncio.sleep(backoff)

            logger.error(f"[ResilientAI] '{name}' exhausted all retries for {action_name}. Falling back to next provider...")

        logger.critical(f"[ResilientAI] All providers in execution chain failed for {action_name}. Raising last exception.")
        raise last_exception or Exception(f"All AI providers failed for {action_name}")

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        return await self._execute_with_resilience("generate_text", "generate_text", prompt, system_instruction=system_instruction, temperature=temperature)

    async def generate_json(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        return await self._execute_with_resilience("generate_json", "generate_json", prompt, schema, system_instruction=system_instruction, temperature=temperature)

    async def chat_completion(self, messages: List[Dict[str, str]], system_instruction: Optional[str] = None, temperature: float = 0.7) -> str:
        return await self._execute_with_resilience("chat_completion", "chat_completion", messages, system_instruction=system_instruction, temperature=temperature)

    async def generate_embedding(self, text: str) -> List[float]:
        return await self._execute_with_resilience("generate_embedding", "generate_embedding", text)

    async def generate_text_stream(self, prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        chain = self._get_execution_chain()
        for name, provider in chain:
            try:
                logger.info(f"[ResilientAI] Starting text stream via '{name}'")
                async for chunk in provider.generate_text_stream(prompt, system_instruction, temperature):
                    yield chunk
                return
            except Exception as e:
                logger.warning(f"[ResilientAI] Streaming failed on '{name}': {e}. Trying fallback provider...")
                continue
        # Mock stream fallback
        async for chunk in self.providers["mock"].generate_text_stream(prompt, system_instruction, temperature):
            yield chunk

    def get_usage_metrics(self) -> Dict[str, Any]:
        metrics = {}
        for name, provider in self.providers.items():
            metrics[name] = provider.get_usage_metrics()
        return metrics


# =====================================================================
# Factory for Dependency Injection
# =====================================================================
class AIProviderFactory:
    _instance: Optional[AIProvider] = None

    @classmethod
    def get_provider(cls, db_session=None) -> AIProvider:
        # Load dynamic configurations if db_session is available
        api_keys = {
            "gemini": getattr(settings, 'GEMINI_API_KEY', ''),
            "groq": getattr(settings, 'GROQ_API_KEY', ''),
            "openrouter": getattr(settings, 'OPENROUTER_API_KEY', '')
        }
        active_provider = getattr(settings, 'AI_PROVIDER', 'gemini').lower()
        fallback_order = ["gemini", "groq", "openrouter", "vertex", "mock"]

        if db_session:
            try:
                from backend.app.infrastructure.config_service import ConfigService
                cfg = ConfigService(db_session)
                gemini_key = cfg.get_secret("ai.gemini.api_key") or api_keys["gemini"]
                groq_key = cfg.get_secret("ai.groq.api_key") or api_keys["groq"]
                openrouter_key = cfg.get_secret("ai.openrouter.api_key") or api_keys["openrouter"]
                
                if gemini_key: api_keys["gemini"] = gemini_key
                if groq_key: api_keys["groq"] = groq_key
                if openrouter_key: api_keys["openrouter"] = openrouter_key

                priority_setting = cfg.get("ai.provider_priority")
                if priority_setting and isinstance(priority_setting, list):
                    fallback_order = priority_setting
            except Exception as e:
                logger.warning(f"[AIProviderFactory] Dynamic config load fallback: {e}")

        return ResilientAIProviderManager(
            primary_provider_name=active_provider,
            fallback_order=fallback_order,
            api_keys=api_keys
        )
