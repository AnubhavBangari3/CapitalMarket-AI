# CapitalMarket AI

## AI-Powered Settlement Failure Investigation & Resolution Platform

## Microsoft Build AI Hackathon 2026 Submission

**Theme:** Agentic Web
**Category:** Orchestrate Actions Across Services

---

# Problem Statement

Settlement failures in Capital Markets require operations teams to manually investigate multiple systems before identifying root causes.

Typical investigation requires checking:

* SWIFT confirmations
* Settlement instructions (SSI)
* Cash balances
* Security holdings
* Counterparty details
* Trade records
* Previous investigation history

This process is:

* Slow
* Manual
* Error-prone
* Expensive
* Distributed across systems

CapitalMarket AI automates this process using AI agents.

---

# Solution Overview

CapitalMarket AI is an AI-powered settlement investigation platform that:

1. Accepts uploaded SWIFT settlement confirmation files
2. Parses settlement messages automatically
3. Investigates failures across multiple datasets
4. Generates AI-based Root Cause Analysis
5. Creates recommended actions
6. Orchestrates actions across services
7. Produces investigation timelines and audit logs

---

# Why This Fits Microsoft Build AI

| Hackathon Requirement               | Implementation                                   |
| ----------------------------------- | ------------------------------------------------ |
| Agentic Web                         | AI agents investigate settlement failures        |
| Orchestrate Actions Across Services | Connects storage, parser, DB, RCA, notifications |
| Multi-step Workflows                | Parse → Investigate → RCA → Action               |
| Useful Automation                   | Replaces manual investigations                   |
| Microsoft Stack                     | Azure OpenAI + Semantic Kernel + Azure           |
| Working Prototype                   | End-to-end investigation workflow                |

---

# Architecture

```text
User / Judge Dashboard
Next.js + Vercel
        ↓
Django DRF Upload API
SwiftFileUploadAPIView
        ↓
Uploaded SWIFT File Storage
Azure Blob Storage
        ↓
SWIFT Confirmation Parser
MT544 / MT545 / MT546 / MT547
        ↓
Extracted Settlement Data
Trade Ref / ISIN / Qty / Amount
        ↓
Operational Database Layer
Trades / SSI / Holdings / Cash
        ↓
Investigation Engine
Validation + Failure Detection
        ↓
Semantic Kernel Workflow
Agent Orchestration
        ↓
Azure OpenAI RCA Agent
Root Cause + Recommendations
        ↓
Action Orchestrator
Mock Jira / Teams / Outlook
        ↓
Audit Dashboard
Timeline / Logs / Actions
```

---

# Core Features

## SWIFT Confirmation Parsing

Supported Messages:

* MT544
* MT545
* MT546
* MT547

Extracted Fields:

* Trade Reference
* Settlement Date
* Quantity
* ISIN
* Counterparty
* Confirmation Type
* Amount

---

## Investigation Engine

### SSI Validation

* Incorrect settlement instructions
* Missing SSI mapping
* Counterparty mismatch

### Cash Validation

* Cash shortage
* Currency mismatch
* Missing funding

### Securities Validation

* Insufficient holdings
* Quantity mismatch

### Settlement Validation

* Date mismatch
* Invalid confirmation state

---

# AI RCA Agent

Produces:

* Root Cause
* Failure Explanation
* Operational Risk
* Confidence Score
* Recommended Actions

Example:

```text
Root Cause:
Counterparty SSI mismatch

Risk:
High

Recommended Action:
Update settlement instructions and resend confirmation
```

---

# Cross Service Orchestration

Services Connected:

* File Upload
* Storage Layer
* Database
* AI Investigation
* Ticket Creation
* Email Preview
* Teams Notification
* Dashboard

Workflow:

```text
Upload
 ↓
Parse
 ↓
Investigate
 ↓
Generate RCA
 ↓
Create Ticket
 ↓
Send Notification
 ↓
Update Timeline
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind
* Vercel

## Backend

* Django
* Django REST Framework
* Python

## AI Stack

* Azure OpenAI
* Semantic Kernel
* Azure AI Foundry

## Database

* Azure SQL

## Cloud

* Azure App Service
* Azure Blob Storage

## Search / Memory

* Azure AI Search

---

# Project Structure

```text
frontend/
backend/

apps/
   uploads/
   investigations/
   dashboard/
   audit/

services/
   parser/
   investigation/
   semantic_kernel/
   rca/

storage/

docs/
```

---

# Local Setup

## Backend

```bash
git clone <repo>

cd backend

python -m venv env

source env/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Azure Deployment

## Backend Deployment

Deploy backend on:

```text
Azure App Service
```

Run migrations:

```bash
python manage.py migrate
```

Seed sample data:

```bash
python manage.py seed_dummy_data
```

Restart App Service.

---

# Azure Deployment & Database Setup

Backend is already deployed and configured for evaluation.

Database initialization:

```bash
python manage.py migrate
```

Expected:

```text
No migrations to apply.
```

This confirms schema synchronization.

---

## Dummy Data Seeding

Populate operational sample data:

```bash
python manage.py seed_dummy_data
```

Generated Data:

* Trade Records
* Investigation Results
* Alerts
* Dashboard Metrics
* Audit Logs

Optional Validation:

```bash
python manage.py shell
```

```python
from apps.uploads.models import *

Trade.objects.count()
InvestigationResult.objects.count()
AuditLog.objects.count()
```

---

# Judge Instructions

1. Open live application
2. Navigate to Upload SWIFT page
3. Upload sample SWIFT confirmation file
4. Wait for parsing and AI investigation
5. Open Investigations page
6. Review RCA output
7. Open Alerts page
8. Open Audit Logs page

Expected Demo Flow:

```text
Upload
 ↓
Parse
 ↓
Investigate
 ↓
Generate RCA
 ↓
Generate Actions
 ↓
Audit Trail
```

---

# Validation Checklist

✔ Upload works
✔ Investigation works
✔ Dashboard visible
✔ Alerts visible
✔ Audit logs visible
✔ Azure OpenAI RCA generated

No additional infrastructure setup required for judges.

---

# Demo Flow For Judges

Step 1: Upload SWIFT confirmation file

Step 2: Parser extracts settlement data

Step 3: Investigation engine validates records

Step 4: AI generates RCA

Step 5: Ticket generated

Step 6: Notification preview shown

Step 7: Audit timeline updated

---

# Future Enhancements

* Real Teams integration
* Outlook integration
* Jira APIs
* Real-time monitoring
* Multi-agent investigations
* Production SWIFT adapters

---

# Data Disclaimer

All trade records, SWIFT messages, counterparties, identifiers, alerts, emails, and operational datasets used in this project are synthetically generated for testing and demonstration purposes only.

No real financial or customer data has been used.

---

# Contributors

Anubhav Bangari

Full Stack Engineer | Capital Markets | AI Builder

---

# License

MIT License
