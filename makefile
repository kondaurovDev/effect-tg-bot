run:
	tsx src/bot-logic.ts

check:
	curl -X POST https://api.telegram.org/bot7529626191:AAHIF9V0Ex0zA1Z4QbVKu53-s2FFJhdF1PI/getUpdates \
		-H "Content-Type: application/json" \
		-d '{"allowed_updates": ["message"]}' | jq .
