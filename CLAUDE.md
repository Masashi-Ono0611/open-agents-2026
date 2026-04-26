# open-agents-2026

ETHGlobal Open Agents hackathon project (April 24 – May 6, 2026).

## Context

- Hackathon: https://ethglobal.com/events/openagents
- Prize details: docs/ethglobal-openagents-prizes.md
- Event overview: docs/ethglobal-openagents-overview.md

## Stack

_TBD — to be defined when app concept is finalized._

## Commands

_TBD_

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
