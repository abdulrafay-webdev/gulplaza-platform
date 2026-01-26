---
id: 001
title: update-constitution-gul-plaza
stage: constitution
date: 2026-01-24
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: main
user: Yousuf Traders
command: /sp.constitution
labels: [constitution, principles, setup, gul-plaza]
links: null
files_yaml:
 - .specify/memory/constitution.md
tests_yaml: []
prompt_text: |
 /sp.constitution Tum aik spec-driven AI engineering agent ho.Is project mein:- Tum credentials ya configurations ke baghair kaam aagay nahi barhao ge.- Tum pehle clearly batao ge ke implementation ke liye kaun kaun se credentials ya access chahiye.- Jab tak main required credentials provide na kar doon, tum implementation pause rakho ge.- Tum kisi cheez ka guess ya default assume nahi karoge.- Credentials provide ho jaane ke baad hi next step par move karo ge.- Project ka scope strictly yeh hai:  Gul Plaza ke liye multi-shop ordering platform.- Tech stack fixed hai:  Backend: FastAPI + SQLModel + Neon PostgreSQL  Authentication & Role-Based Access: Clerk- Data isolation mandatory hai:  Har shop owner sirf apni shop ke orders dekh sakta hai.- Har required credential ke sath yeh bhi batao ge:  woh kahan se milega (dashboard, official docs, ya service).- Coding sirf /sp.implement ke baad aur credentials milne ke baad start karni hai.
response_text: |
 Updated constitution to v1.1.0 with Gul Plaza specific principles, strict tech stack (FastAPI/Neon/Clerk), and explicit credential handling rules.
outcome: success
evaluation:
  - checklist:
      - [x] Principles reflect user intent
      - [x] Tech stack locked
      - [x] Constraints explicit
---

# Prompt History Record

## User Prompt
/sp.constitution Tum aik spec-driven AI engineering agent ho.Is project mein:- Tum credentials ya configurations ke baghair kaam aagay nahi barhao ge.- Tum pehle clearly batao ge ke implementation ke liye kaun kaun se credentials ya access chahiye.- Jab tak main required credentials provide na kar doon, tum implementation pause rakho ge.- Tum kisi cheez ka guess ya default assume nahi karoge.- Credentials provide ho jaane ke baad hi next step par move karo ge.- Project ka scope strictly yeh hai:  Gul Plaza ke liye multi-shop ordering platform.- Tech stack fixed hai:  Backend: FastAPI + SQLModel + Neon PostgreSQL  Authentication & Role-Based Access: Clerk- Data isolation mandatory hai:  Har shop owner sirf apni shop ke orders dekh sakta hai.- Har required credential ke sath yeh bhi batao ge:  woh kahan se milega (dashboard, official docs, ya service).- Coding sirf /sp.implement ke baad aur credentials milne ke baad start karni hai.

## Agent Response
Updated constitution to v1.1.0 with Gul Plaza specific principles, strict tech stack (FastAPI/Neon/Clerk), and explicit credential handling rules.
