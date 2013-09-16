
install:
	@npm install
	@bower cache clean
	@bower install
	@cp app/components/topcoat/css/topcoat-mobile-light.css public/less/topcoat.less

.PHONY: install
