# 🛡️ Vigilant Log AI
### Enterprise-Grade Error Analytics with AI-Driven Solutions & Data Masking

[![NVIDIA AI](https://img.shields.io/badge/NVIDIA_AI-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://www.nvidia.com/en-us/ai-data-science/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**Vigilant Log AI** is a state-of-the-art error management ecosystem that combines **Predictive AI** with **Zero-Trust Security**. It automatically captures, masks, and analyzes application logs to provide instant solutions, all while ensuring that sensitive data like API keys and PII never leave your secure perimeter.

---

## 🚀 Key Modules & Capabilities

### 🔐 Multi-Tier Privacy Governance
*   **Public Tier**: Share anonymized logs and AI solutions globally to build a community-driven knowledge base.
*   **Team Tier**: Secure collaboration within your organization—logs and solutions are isolated to your verified team members.
*   **Private Tier**: Absolute isolation for high-security applications—your data and AI insights are yours alone.

### 🎭 Intelligent Data Masking (Presidio-Powered)
*   **PII & Secret Scrubbing**: Uses Microsoft Presidio and custom regex engines to identify and mask tokens, session IDs, and user data.
*   **Preservation Logic**: Intelligently preserves exception traces and stack frames so debugging context remains intact while secrets are wiped.
*   **Fingerprint Deduplication**: Generates unique SHA-256 signatures for masked logs to prevent redundant AI processing and provide instant cache hits.

### 🤖 AI Solution Engine (NVIDIA NIM)
*   **Instant Diagnostics**: Automatically sends masked logs to high-performance LLMs (e.g., Llama-3.1-450b) to generate actionable code fixes.
*   **Classified Caching**: AI solutions are stored and retrieved based on your privacy tier, ensuring maximum speed with minimum API overhead.
*   **Hit-Count Analytics**: Track the frequency of specific errors to prioritize high-impact architectural fixes.

### 👥 Team Management System
*   **Role-Based Access (RBAC)**: Manage team members with Admin and Member roles.
*   **Invite-Only Onboarding**: Secure team joining via unique UUID-based invite codes.
*   **Audit Trails**: Track who submitted what and when within your team environment.

---

## 🎨 Design & Interaction
*   **Clean Professionalism**: A sleek, dark-themed dashboard focused on data clarity and rapid issue resolution.
*   **Real-Time Monitoring**: Live log streams with instant "Solution Available" notifications.
*   **Developer-First UX**: Deep-linkable error reports with copy-pasteable AI code suggestions.

---

## 🛠️ Technology Stack
*   **API Framework**: Node.js & Express.js (High-Speed Throughput)
*   **Database**: MongoDB with Mongoose (Flexible Error Schema)
*   **Masking Core**: Python with Microsoft Presidio (Anonymization Microservice)
*   **AI Intelligence**: NVIDIA NIM (Llama-3.1 & Maverick Models)
*   **Security**: JWT with RBAC and SHA-256 Fingerprinting

---

## ⚡ Performance Engineering
*   **Microservice Architecture**: The heavy Python-based masking logic is decoupled from the Node.js API to ensure non-blocking log ingestion.
*   **Classified Search Indexing**: MongoDB queries are optimized using composite indexes on `{userType, teamId, fingerprint}` for sub-50ms cache lookups.
*   **Fail-Safe Redundancy**: Automatic regex-based masking fallback if the primary NLP microservice is under high load.

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NKcoder5/safe-log-ai.git
   cd safe-log-ai
   ```

2. **Launch the Masking Microservice (Python)**:
   ```bash
   cd masking-service
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

3. **Launch the Backend API (Node.js)**:
   ```bash
   cd ../backend
   npm install
   # Create .env with MONGO_URI, NVIDIA_NIM_API_KEY, and JWT_SECRET
   node server.js
   ```

4. **Verify Connectivity**:
   ```bash
   node test/test-user-types.js
   node test/test-teams.js
   ```

---

## 📄 License
Licensed under the **MIT License**.

---
*Created with ❤️ for Secure, AI-Driven Software Reliability.*
