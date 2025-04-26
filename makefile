run:
	tsx src/local-run.ts

deploy:
	tsup
	rm -rf lambda.zip
	cp ui/wakeup.html dist
	zip lambda.zip -r dist
	tsx scripts/deploy/_main.ts

send-event:
	curl -X POST https://1l9th6jui9.execute-api.eu-central-1.amazonaws.com/store-tg-update \
		-H "x-telegram-bot-api-secret-token: secret!" \
		-d "{}"

dev:
	vite ui
