# ⚡ GitPulse Analytics

> **High-Performance GitHub Developer & Repository Intelligence Platform**  
> Built with **FastAPI**, embedded columnar **DuckDB**, and **Next.js 15 (Bento Grid UI)**.

---

## 🤖 AI-Assisted Development

Proyek ini dikembangkan dengan pendekatan **AI-Assisted Pair Programming** (berkolaborasi dengan Google DeepMind Antigravity). AI berperan membantu perancangan arsitektur, optimasi kueri analitik time-series DuckDB, pembuatan test suite komprehensif, serta orkestrasi kontainerisasi Docker *multi-stage* di bawah review ketat standar IT consultant guna memastikan kode tetap bersih, modular, serta **bebas dari over-engineering dan AI-slop**.

---

## ✨ Fitur Utama

* **⚡ Sub-15ms Columnar Analytics (DuckDB):** Menghitung jutaan event time-series GitHub tanpa perlu server database eksternal terpisah yang mahal.
* **⏱️ DORA & Engineering Speed:** Memonitor *DORA Lead Time to Merge*, *Time to First Review (TTFR)*, dan rasio kesehatan ukuran PR (*PR Size Hygiene*).
* **👤 Woopra-Style Contributor Journey:** Klik developer di tabel peringkat untuk membuka drawer linimasa kronologis seluruh aktivitas commit, PR, dan delta baris kode (+/-).
* **📉 Shopify-Style PR Funnel:** Corong konversi lifecycle PR otomatis mendeteksi tahap bottleneck dengan *drop-off* >25% dan memberikan rekomendasi teknis perbaikan.
* **🔥 Kalodata-Style Momentum Badges:** Klasifikasi produktivitas developer dengan lencana podium (`🥇 Gold`, `🥈 Silver`, `🥉 Bronze`) dan tag kecepatan (`🔥 High Velocity`, `⚡ Surging`, `📈 Steady`).
* **💬 Hybrid AI Text-to-Insight (Cmd+K):** Tanya jawab analitik dalam bahasa alami yang dilindungi **AST SQL Sanitizer (`sqlglot`)** untuk kueri read-only yang aman.
* **🔑 GitHub PAT Resilience:** Dialog Personal Access Token lokal di browser untuk menaikkan limit API GitHub dari 60 menjadi **5.000 request/jam**.
* **💸 $0/Bulan Production Ready:** Image Docker multi-stage super ringan (~95 MB) dan panduan deploy tanpa biaya di Cloudflare Pages & Fly.io.

---

## 🚀 Cara Menjalankan

### Opsi 1: Menjalankan Langsung di Lokal (Windows / macOS / Linux)

Pastikan Python 3.12+ dan Node.js 20+ sudah terpasang.

```powershell
# Jalankan script otomatis dari direktori root:
.\start_dev.ps1
```
* **Frontend UI:** [http://localhost:3000](http://localhost:3000)
* **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Opsi 2: Menggunakan Docker Compose (Satu Perintah)

```bash
docker compose up -d --build
```

---

## 🧪 Testing & Verifikasi

Proyek ini dilengkapi pengujian otomatis dari backend hingga frontend:

```bash
# Jalankan test suite backend (22 tests passing):
pytest -v backend/tests

# Jalankan test suite frontend (Node 24 native test runner):
cd frontend && npm test
```

---

## 🛠️ Tech Stack

* **Backend:** FastAPI, Python 3.12, DuckDB, Pydantic, sqlglot
* **Frontend:** Next.js 15 (App Router, Standalone), TypeScript, Tailwind CSS, Lucide React, Recharts, Magic UI
* **DevOps:** Docker Multi-stage Builds, Docker Compose, GitHub Actions Ready
* **Deployment Playbook:** Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk rute peluncuran seharga $0/bulan.
