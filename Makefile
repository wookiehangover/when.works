
install:
	npm install
	bower install
	test -d public/topcoat || mkdir public/topcoat
	cp -r app/components/topcoat/release/* public/topcoat

