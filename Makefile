TOPCOAT_TARGET = 'mobile'
TOPCOAT_COLOR = 'dark'

install:
	@npm install
	@bower cache clean
	@bower install
	make topcoat

topcoat:
	@cp app/components/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css public/less/topcoat.less

.PHONY: install topcoat
