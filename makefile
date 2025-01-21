run:
	tsx src/local-run.ts

deploy:
	tsup
	cp ui/wakeup.html dist
	zip lambda.zip -r dist
	tsx scripts/deploy/_main.ts

dev:
	vite ui