TOPCOAT_TARGET := 'mobile'
TOPCOAT_COLOR := 'dark'

all: install topcoat bootstrap

install:
	@npm install
	@bower cache clean
	@bower install

topcoat:
	cp app/components/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css public/less/topcoat.less

bootstrap:
	find public/less/bootstrap -name *.less -delete
	cp app/components/bootstrap/less/*.less public/less/bootstrap

.PHONY: all install
