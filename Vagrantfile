# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = 'ubuntu/trusty64'

  config.vm.provision "docker" do |d|
    d.build_image "/vagrant",
      args: '-t "app"'

    d.pull_images "redis"
    d.run "redis",
      args: "-P"

    d.pull_images "dockerfile/rethinkdb"
    d.run "dockerfile/rethinkdb",
      args: "-p 8080:8080 -P"

    d.run "app",
      args: "-v '/vagrant:/usr/src/app' -p 3000:3000 --link redis:redis --link dockerfile-rethinkdb:rethinkdb"
  end

  config.vm.define "web" do |web|
    web.vm.network "forwarded_port", guest: 3000, host: 3000
    web.vm.network "forwarded_port", guest: 8080, host: 8080,
      auto_correct: true
  end
end
