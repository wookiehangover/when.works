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

.PHONY: all install deps
