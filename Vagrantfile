# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

ENV['VAGRANT_DEFAULT_PROVIDER'] ||= 'docker'

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.define "redis" do |redis|
    redis.vm.provider 'docker' do |d|
      d.image  = 'dockerfile/redis'
      d.name   = 'when_works_web_redis'
    end
  end

  config.vm.define "rethinkdb" do |rethinkdb|
    rethinkdb.vm.provider 'docker' do |d|
      d.image = 'dockerfile/rethinkdb'
      d.name  = 'when_works_web_rethinkdb'
      d.ports  = ['8080:8080']
    end

    rethinkdb.vm.network "forwarded_port", guest: 8080, host: 8080,
      auto_correct: true
  end

  config.vm.define "web" do |web|
    web.vm.provider 'docker' do |d|
      d.image           = 'wookiehangover/whenworks'
      d.name            = 'when_works_web'
      d.create_args     = ['-i', '-t']
      d.remains_running = false
      d.cmd             = ['/bin/bash', '-l']
      d.ports           = ['3000:3000']

      d.link('when_works_web_redis:redis')
      d.link('when_works_web_rethinkdb:rethinkdb')
    end

    web.vm.synced_folder ".", "/usr/src/app"
  end

end
