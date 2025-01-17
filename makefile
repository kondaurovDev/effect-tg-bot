run:
	tsx src/local-run.ts

deploy:
	tsup
	zip lambda.zip -r dist
	tsx scripts/deploy/_main.ts