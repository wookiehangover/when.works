TOPCOAT_TARGET := 'mobile'
TOPCOAT_COLOR := 'light'

all: install topcoat bootstrap

install:
	@npm install
	@bower cache clean
	@bower install

build:
	grunt
	npm run build

watch:
	npm run watch & nodemon -i app -i public server

topcoat:
	cp node_modules/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css public/less/topcoat.less

bootstrap:
	find public/less/bootstrap -name *.less -delete
	cp app/components/bootstrap/less/*.less public/less/bootstrap

.PHONY: all install deps
