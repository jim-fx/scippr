MAKEFLAGS += -j2

dev: dev-server dev-ext

dev-server:
	cd server && gin --appPort 8080 --port 3000

dev-ext:
	cd extension && esbuild content/index.js --bundle --outfile=content/bundle.js --watch --minify --sourcemap
	
deploy:
	git subtree push --prefix server origin deploy