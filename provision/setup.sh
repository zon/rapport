#!/usr/bin/env bash

# mongo repo
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

# node repo (runs apt-get update)
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo ln -sf /usr/bin/nodejs /usr/bin/node

sudo apt-get install -y build-essential mongodb-org redis-server nodejs