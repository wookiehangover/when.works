TOPCOAT_TARGET := mobile
TOPCOAT_COLOR := light

all: install topcoat bootstrap

install:
	@npm install

build:
	grunt
	npm run build-production

watch:
	npm run watch & nodemon -i app -i public server

topcoat:
	cp node_modules/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css public/less/topcoat.less
	cp node_modules/topcoat-icons/font/icomatic.* public/font/
	cp node_modules/topcoat-icons/font/icomatic.css public/less/components/icons.less
	cp node_modules/topcoat-icons/font/icomatic.js public/js/

bootstrap:
	find public/less/bootstrap -name *.less -delete
	cp app/components/bootstrap/less/*.less public/less/bootstrap

.PHONY: all install deps
