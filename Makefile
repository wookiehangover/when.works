TOPCOAT_TARGET := mobile
TOPCOAT_COLOR := light

all: install topcoat bootstrap

install:
	@cp config/config-example.js config/default.js
	@npm install
	@npm run build

build:
	@grunt
	@npm run build-production

watch:
	@npm run watch &
	@npm run watch-test &
	@npm start

topcoat:
	cp node_modules/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css public/less/topcoat.less
	cp node_modules/topcoat-icons/font/icomatic.* public/font/
	cp node_modules/topcoat-icons/font/icomatic.css public/less/components/icons.less
	cp node_modules/topcoat-icons/font/icomatic.js public/js/

bootstrap:
	find public/less/bootstrap -name *.less -delete
	cp app/components/bootstrap/less/*.less public/less/bootstrap

redis:
	docker run -d --name when_works_redis -p 8080:8080 -t dockerfile/redis

rethinkdb:
	docker run -d --name when_works_rethinkdb -p 8080:8080 -t dockerfile/rethinkdb

docker:
	docker run -i -t \
		-e "GOOGLE_SECRET=HzRW_uyVwOI2UlM1MEqY8KDP" -e "GOOGLE_ID=702998348467.apps.googleusercontent.com" \
		-p 3000:3000 \
		-v /Users/sam/dev/repos/when.works:/usr/src/app \
		--name when_works_web \
		--link=when_works_redis:redis --link=when_works_rethinkdb:rethinkdb \
		wookiehangover/whenworks \
		/bin/bash -l

.PHONY: all install deps docker
