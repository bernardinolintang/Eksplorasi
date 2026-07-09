---
description: Run the full plan → code → test → review pipeline
---
Feature request: $ARGUMENTS

Ensure a .pipeline/ directory exists (create it if missing; it is gitignored).
Run this pipeline sequentially, each stage via its subagent:
1. planner subagent → produces .pipeline/spec.md
2. coder subagent → implements, produces .pipeline/changes.md
3. tester subagent → produces .pipeline/test-results.md
4. reviewer subagent → produces .pipeline/review.md
Stop the pipeline immediately if any stage reports a blocker. Do not proceed to
the next stage on failure. Report the final verdict from review.md to me, plus
a one-paragraph summary of what changed.
