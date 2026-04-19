# Requirement

我想做一个转刀刀网页游戏，人物可以移动捡刀，然后捡到就变多，可以相互击杀，击杀后掉落对应数量的刀，这个刀也可以被捡起来，取决于刀刀数量也可以自由移动，避免交战，这个是单机页面游戏，其他的都是npc，刀分为3种红黄蓝，拼杀需要拼数量和颜色（不同等级的话有个计算公式扣除刀），红色最厉害，UI风格参考 图片 @blade.jpeg(uploads/blade.jpeg)

**AI Understanding:**
I can see you're planning a blade battle web game with some interesting mechanics! Based on your description, here's what I understand:
**Game Concept Summary:**
- Single-player web game where you control a character that collects blades
- Three blade types: Red (most powerful), Yellow, Blue with a color-based combat system
- Character movement to collect blades, which increases your blade count
- NPC enemies that can be defeated in combat
- Defeated enemies drop their blades, which can be collected
- Strategic movement to avoid combat when outnumbered
- Color-based combat formula where different blade types have advantage/disadvantage relationships
**Key Mechanics:**
- Blade collection and combat system
- Color hierarchy (Red > ? > ? - need to clarify the order)
- Combat calculation based on blade count and color advantage
- Movement and avoidance mechanics
**Technical Requirements:**
- Single-page web game (HTML/CSS/JavaScript)
- NPC AI for enemy behavior
- Real-time movement and combat
**One clarifying question:** Could you specify the exact color hierarchy and combat formula? For example, is it Red > Blue > Yellow > Red (rock-paper-scissors style), or is Red simply the strongest with the others being equal?
Once you confirm these details, I'll be ready to help you create the implementation plan. Type "start" or "proceed" when you're ready to begin development!

---

## Implementation Notes

- For any unspecified details (combat formulas, game balance, UI layout, tech choices, etc.), make reasonable decisions yourself and document them in the plan. Do NOT ask the user for clarification — proceed with sensible defaults.
- If referenced image files exist in the workspace, treat them as visual style references.

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.
