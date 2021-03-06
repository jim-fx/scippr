MAKEFLAGS += -j2

RELEASE_VERSION ?= $$(git describe --tags `git rev-list --tags --max-count=1`)

dev: dev-server dev-ext

dev-server:
	cd server && gin --appPort 8080 --port 3000

dev-ext:
	cd extension && $$(yarn global bin)/esbuild content/index.js --bundle --outfile=content/bundle.js --watch --minify --sourcemap
	
ext:
	cd extension && $$(yarn global bin)/esbuild content/index.js --bundle --outfile=content/bundle.js --minify --sourcemap && echo "build extension"
	cd extension && zip -r "scippr_$(RELEASE_VERSION).zip" .

deploy:
	git subtree push --prefix server origin deploy