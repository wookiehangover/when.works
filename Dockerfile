FROM node
MAINTAINER Sam Breed <sam@destroy.email>

ADD . /usr/src/app
WORKDIR /usr/src/app

# install your application's dependencies
RUN npm install
RUN npm build

# replace this with your application's default port
EXPOSE 3000

# replace this with your main "server" script file
CMD [ "npm", "start" ]
