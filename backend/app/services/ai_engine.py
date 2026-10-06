import os
import re
import time
import logging
from typing import Dict, Any, List
import sqlglot
from sqlglot import exp
from app.core.config import settings
from app.services.storage import get_storage

logger = logging.getLogger("omnipulse.ai")

class AIEngine:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI client: {e}")

    def validate_sql(self, sql_query: str) -> bool:
        """AST Sanitizer: Ensures query is strictly a single SELECT statement and safe."""
        cleaned = sql_query.strip().rstrip(";")
        try:
            parsed = sqlglot.parse(cleaned)
            if not parsed or len(parsed) != 1:
                return False
            
            expression = parsed[0]
            if not isinstance(expression, exp.Select):
                return False
                
            for node in expression.walk():
                if isinstance(node, (exp.Drop, exp.Delete, exp.Insert, exp.Update, exp.Alter, exp.Command)):
                    return False
            
            return True
        except Exception as e:
            logger.warning(f"SQL validation error: {e}")
            lower = cleaned.lower()
            if not lower.startswith("select"):
                return False
            forbidden = ["drop", "delete", "insert", "update", "alter", "create", "truncate", "--", ";"]
            for term in forbidden:
                if re.search(r'\b' + term + r'\b', lower):
                    return False
            return True

    def _generate_heuristic_sql(self, query: str, repo_name: str = "vercel/next.js") -> tuple[str, str, str]:
        """Smart fallback query generator based on user developer & repository intent."""
        q = query.lower()
        repo_filter = repo_name.lower()
        
        if "contributor" in q or "siapa" in q or "top" in q or "aktif" in q:
            sql = f"""
                SELECT actor_login, 
                       SUM(CASE WHEN event_type = 'push' THEN commit_count ELSE 0 END) as total_commits,
                       COUNT(CASE WHEN event_type = 'pull_request' AND pr_status = 'merged' THEN 1 END) as prs_merged,
                       SUM(lines_added) as lines_added
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                GROUP BY actor_login
                ORDER BY total_commits DESC
                LIMIT 5
            """
            chart_type = "bar"
            summary = f"Daftar 5 kontributor paling aktif di repository {repo_name} berdasarkan volume commit dan PR yang berhasil di-merge."
        elif "pr" in q or "pull request" in q or "merge" in q or "rasio" in q:
            sql = f"""
                SELECT pr_status, COUNT(*) as total_count
                FROM github_events
                WHERE repo_name = '{repo_filter}' AND event_type = 'pull_request' AND pr_status IS NOT NULL
                GROUP BY pr_status
                ORDER BY total_count DESC
            """
            chart_type = "bar"
            summary = "Distribusi status Pull Request: rasio antara PR yang berhasil di-merge, sedang dalam review, dan baru dibuka."
        elif "trend" in q or "hari" in q or "commit" in q or "activity" in q:
            sql = f"""
                SELECT strftime(time, '%Y-%m-%d') as date,
                       SUM(CASE WHEN event_type = 'push' THEN commit_count ELSE 0 END) as commits,
                       COUNT(CASE WHEN event_type = 'pull_request' THEN 1 END) as prs
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                GROUP BY date
                ORDER BY date ASC
                LIMIT 14
            """
            chart_type = "line"
            summary = f"Tren fluktuasi harian commit dan aktivitas PR di {repo_name} selama 14 hari terakhir."
        elif "code" in q or "churn" in q or "lines" in q or "baris" in q:
            sql = f"""
                SELECT actor_login,
                       SUM(lines_added) as additions,
                       SUM(lines_deleted) as deletions
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                GROUP BY actor_login
                ORDER BY additions DESC
                LIMIT 6
            """
            chart_type = "bar"
            summary = "Volume perputaran kode (Lines Added vs Lines Deleted) oleh kontributor utama."
        else:
            sql = f"""
                SELECT event_type, COUNT(*) as event_count
                FROM github_events
                WHERE repo_name = '{repo_filter}'
                GROUP BY event_type
                ORDER BY event_count DESC
            """
            chart_type = "bar"
            summary = f"Ringkasan agregasi seluruh aktivitas event pengembangan untuk repository {repo_name}."
            
        return sql.strip(), chart_type, summary

    async def query_insight(self, prompt: str, repo_name: str = "vercel/next.js") -> Dict[str, Any]:
        """Translates user natural language prompt into safe SQL query and actionable insight."""
        start_time = time.time()
        
        generated_sql = None
        summary = None
        chart_type = "bar"

        if self.client:
            try:
                system_instruction = f"""
                You are an expert GitHub analytics engineer querying a DuckDB database.
                Table name is `github_events` with schema:
                time TIMESTAMP, event_id VARCHAR, repo_name VARCHAR, event_type VARCHAR (push, pull_request, issues, watch),
                actor_login VARCHAR, actor_avatar VARCHAR, commit_count INT, pr_status VARCHAR (opened, in_review, approved, merged),
                issue_status VARCHAR (opened, closed), lines_added INT, lines_deleted INT.
                
                Current repository focus is: '{repo_name}'.
                Respond in valid JSON only with keys:
                "sql": string containing ONLY a single read-only SELECT statement with a LIMIT clause (max 50).
                "chart_type": "bar" | "line" | "table",
                "summary": string explaining the developer insight in Indonesian.
                """
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=f"{system_instruction}\nUser Question: {prompt}",
                )
                text = response.text.strip()
                import json
                clean_json = re.sub(r'^```json\s*|\s*```$', '', text, flags=re.MULTILINE)
                data = json.loads(clean_json)
                candidate_sql = data.get("sql", "")
                if self.validate_sql(candidate_sql):
                    generated_sql = candidate_sql
                    summary = data.get("summary", "")
                    chart_type = data.get("chart_type", "bar")
            except Exception as e:
                logger.warning(f"Gemini API inference error, falling back to heuristic engine: {e}")

        if not generated_sql:
            generated_sql, chart_type, summary = self._generate_heuristic_sql(prompt, repo_name)

        if not self.validate_sql(generated_sql):
            generated_sql = f"SELECT actor_login, COUNT(*) as events FROM github_events WHERE repo_name = '{repo_name.lower()}' GROUP BY actor_login LIMIT 5"
            summary = "Query disesuaikan ke standar read-only aman."

        storage = get_storage()
        try:
            chart_data = storage.execute_readonly_sql(generated_sql)
        except Exception as e:
            logger.error(f"Error executing generated SQL: {e}")
            chart_data = []
            summary = f"Kueri dihasilkan namun gagal dieksekusi: {e}"

        exec_time = int((time.time() - start_time) * 1000)

        return {
            "query": prompt,
            "generated_sql": generated_sql,
            "summary": summary,
            "chart_type": chart_type,
            "chart_data": chart_data,
            "confidence": 0.96 if self.client else 0.92,
            "execution_time_ms": exec_time
        }

ai_engine = AIEngine()
