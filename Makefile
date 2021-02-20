dev:
	cd server
	gin --appPort 8080 --port 3000
deploy:
	git subtree push --prefix server origin deploy