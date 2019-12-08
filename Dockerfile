# base-image for node on any machine using a template variable,
# see more about dockerfile templates here: https://www.balena.io/docs/learn/develop/dockerfile/#dockerfile-templates
# and about resin base images here: https://www.balena.io/docs/reference/base-images/base-images/
FROM balenalib/raspberrypi3-node:12
# FROM balenalib/raspberrypi4-64-node:12

# use apt-get if you need to install dependencies,
# for instance if you need ALSA sound utils, just uncomment the lines below.
RUN apt-get update && apt-get install -yq \
   python alsa-utils libasound2-dev build-essential && \
   apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up ALSA config
# COPY config/asound.conf /etc/asound.conf

# Defines our working directory in container
WORKDIR /usr/src/app

# Copies the package.json first for better cache on later pushes
COPY package.json package.json
COPY package-lock.json package-lock.json

# This install npm dependencies on the balena build server,
# making sure to clean up the artifacts it creates in order to reduce the image size.
RUN JOBS=MAX npm install --unsafe-perm && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
COPY . ./

# Enable systemd init system in container
ENV INITSYSTEM on

# server.js will run when container starts up on the device
CMD ["npm", "start"]
