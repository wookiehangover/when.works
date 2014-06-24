# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = 'ubuntu/trusty64'

  config.vm.provision "docker" do |d|
    d.pull_images "redis"
    d.run "redis",
      args: "-P"

    d.pull_images "dockerfile/rethinkdb"
    d.run "dockerfile/rethinkdb",
      args: "-P"
  end

  config.vm.define "web" do |web|
    web.vm.provision "shell", path: "setup.sh"
    web.vm.network "forwarded_port", guest: 3000, host: 3000
    web.vm.network "forwarded_port", guest: 8080, host: 8080,
      auto_correct: true
  end
end
