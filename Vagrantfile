Vagrant.configure(2) do |config|
	config.vm.box = "ubuntu/trusty64"
	config.vm.synced_folder ".", "/opt/rapport"
	config.vm.provision :shell, path: "provision/setup.sh"
	config.vm.network "forwarded_port", guest: 8088, host: 8088
end