#!/bin/sh
cd '/app/workspaces/2e70100f-43b2-4422-9607-638a347c882f' || exit 1
exec 'claude' '--dangerously-skip-permissions' '--print' '/humanize:start-rlcr-loop docs/plan.md --max 10 --yolo --codex-model gpt-5:high --full-review-round 5 --track-plan-file --push-every-round'
