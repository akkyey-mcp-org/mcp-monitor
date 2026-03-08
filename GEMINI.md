#  (Agent Behavior Protocol)

## 1.  (Principles & Agent Skills)

** (Agent Skills)**
****

****
>  ** `skill_name`**

###  (Session Start)

** `.gemini` **

```bash
/sync-gemini
```

:
```bash
cd .gemini && git pull origin main && cd ..
```

> [!NOTE]
>  `anti_patterns.md`

###  (Continuous Improvement)

****


###  (Mandatory Skills)


 `.agent/skills/<skill_name>/SKILL.md` 

1.  ** (`feat_implementer`):**
    *   **:** 
    *   **:** (Plan)(History)

2.  ** (`quality_guard`):**
    *   **:** Lint
    *   **:** `vitest` / `jest` (Coverage), `eslint`, `prettier`, `tsc`

3.  ** (`trouble_reporter`):**
    *   **:** 
    *   **:** (`trouble/`)

4.  ** (Approval Before Implementation):**
    *   **:** Implementation Plan
    *   **:** 
    *   **:** Typo

5.  ** (`context_syncer`):**
    *   **:** 
    *   **:** `full_context` `task.md` / `backlog.md` 

6.  **Git (`git_committer`):**
    *   **:** 
    *   **:** 

7.  ** (`quality_gatekeeper`):**
    *   **:** 
    *   **:** Radon(CC: A)(MI: 65)

### 1.1  (Prohibited Actions & Anti-Patterns)

****

1.  **Git (No Direct Git Commit):**
    *   `run_command`  `git commit -m ...`  `git_committer` 
2.  ** (Use Safe Shell V2):**
    *    `run_command` MCP **`safe-shell-server` (`execute_safe`)** 
    *   **V2 **: AUTO PYTHONPATH `export PYTHONPATH` 
    *   `execute_macro` 
3.  ** (No Skipping Diagnostics):**
    *    `npm test`  `npm run build` 
4.  **:**
    *    `GEMINI.md` 

5.  ** (Mandatory Pre-flight Validation):**
    *   `run_command`, `execute_safe`  `$GEMINI_ROOT/gemini-core/scripts/validate_command.py` 
    *   Exit 1


---

## 2.  (Communication & Language)

1.  **:**
    *   ****
2.  **:**
    *   HTML

---

## 3.  (Environment & Tools)

1.  **:**
    *    `node_modules`  `npm`  `npx` 
2.  **:**
    *    `tsc` `npx tsc` 
3.  ** (Environmental Isolation):**
    *    (`production`) Google Drive 
    *   DB (`STOCK_ENV` )  `/tmp` 

4.  ** (Adaptive Tiered Defense):**
    *   
    *   **Tier 1 ()**: 
    *   **Tier 2 (OS/Docker)**: 
    *   **Tier 3 (/bwrap)**: 
    *   
    *   ****:  Tier 3  `runsc` 

5.  ** (Volatile Identity Generation):**
    *   IdentityGit User, API Keys
    *   

6.  ** (AI Vision Synchronization):**
    *   WordPress  AI SSH 
    *   ****: Chrome  SSH Safe-Shell  AI 
    *   
---

## 4.  (Command Execution Safety)



1.  ** (One Command at a Time):**
    *   `&&`  `;` 1
    *    `git pull && git push` 
2.  ** (Pre-flight Cleanup):**
    *   `git`, `npm`, `python`
    *   `safe_commander` `get_process_status` 
4.  ** (Survival Execution):**
    - `background=True`  Safe-Shell 
    -  `get_process_status` 
5.  ** (5-Second Rule):**
    *    **5**  `safe-shell-server` 
    *    `run_command` 
6.  ** (Mandatory Pre-flight Check):**
    *   ** `ps`  `pgrep` **
    *   

7.  **Shell (Disarmament via shell=False):**
    *   `shell=True` `execve` (shell=False) 
    *   

8.  **CLI (CLI Idioms):**
    *   `find` `find ... | xargs ...`
    *    `-exec` : `find ... -exec ... {} +`

9.  ** (System Administration):**
    *   systemd  `loginctl enable-linger <user>` 

10. **:**
    *   Safe-Shell V2, ,  `run_command` 
    *   `validate_command.py` 


---

## 5.  (Definition of Done)

 (`notify_user`) ****

1.  **Git (Clean Status):**
    *   `git status` Modified / Untracked
    *    (`stock-analyzer4/` ) 
2.  ** (Remote Sync):**
    *    `git push` 
    *   Colab
3.  ** (Final Verification):**
    *    `npm test` 

4.  **Design-Integrity-First ():**
    *   AI Ruff, Black, Prettier
    *   Step 3 CI 

****

### 5.1  (Workflow First)

Skills
- **`/safe-push`**: Safe-Shell V2 
- **`/sync-gemini`**: 

### 5.2  (Tooling Escalation)
AI `execute_safe`  **2 **  `run_command` 
 `register_macro` 

---

## 6.  (Infinite Loop Prevention)


**2******  **** 

---

## 7.  (Documentation & Blog)

1.  **:**
    -    **`blog/`**  `mcp-servers/blog/`
    -   `docs/` 

2.  ** (Continuous Blog Idea Capture):**
    *   ** `blog/ideas/YYYY-MM-DD_ideas.md` **
    *   
    *   ** `.agent/local_insights.md` **
    *    (`notify_user`) 

---

## 8.  (Memory Management)

MCP (`memory-server`) 

### 7.1 
*   **:** 
*   **:** `user_preference` (), `project_insight` (), `task_history` (), `code_pattern` () 
*   **:** `importance` (1-5) 

### 7.2  (Memory Operations)

**A.  (Recall)**
 `search_memories` 
*   : 

**B.  (Storage)**
 `create_memory` 
*   **:** 
*   **:** 
*   **:** FTS5
*   ** (Failure Recording):**  `trouble_reporter` **** `tag: ["failure", "anti_pattern"]` 

**C.  (Promotion)**
*   **:**  `docs/`  (Git)
*   **:**  `memory-server` 
*   ** (Macros):** `persist=True`  Safe-Shell `/tmp/macros.json`

**D. **
*   **:**  `export_memories` JSONGit (`docs/memory_backup.json` ) 
*   **:**  `delete_memory`  `VACUUM` (SQLite) 

*   **:**  `delete_memory`  `VACUUM` (SQLite) 

---

## 9.  (Context Management & Governance)

`gemini-core` Single Source of Truth

### 8.1  (Centralized Command)
*   ****: `GEMINI_ROOT` (: `/home/irom/dev`) 
*   ** (Core)**: `$GEMINI_ROOT/gemini-core`
    *   ****:  (`GEMINI.md`) and 
    *   ****: ** (Read/Write)**
*   ** (Projects)**: `$GEMINI_ROOT/` 
    *   ****: 
    *   ****: ** (Read-Only)**`.gemini` `chmod a-w`

### 8.2  (Operational Workflow)
1.  **:**
    *   `gemini-core` Push
2.  **:**
    *    `/sync-gemini` 
    *   

### 8.3 
 `.gemini` 

```bash
git submodule add https://github.com/akkyey/gemini-core.git .gemini
/sync-gemini  # 
```

---

## 10.  (Insight Feedback Loop)

gemini-core

### 9.1  (Local Buffer)
*    **`.agent/local_insights.md`** Inbox
*   
*    (`memory-server`) 

### 9.2  (Promotion)
*    **`/promote-insights`**  `local_insights.md` 
*   
    *   ****: `GEMINI.md`
    *   ****: `anti_patterns.md`
    *   ****: `.agent/skills/*.md`
*   `/sync-gemini` 

### 9.3  (Definition of Done)
*    `local_insights.md` 

---

## 11.  (Self-Correction & Compliance Cycle)

AI Safe-Shell V2 `run_command` ****

### 11.1 
1.  ****: 
2.  ** (`memory-server`)**:  `tag: ["failure", "compliance"]` 
3.  **Local Insights **:  `.agent/local_insights.md` 

### 11.2 
****
