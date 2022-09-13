FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

env RUNNING_ON_DOCKER true

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Build app
RUN npm run build

# For now it will run using root beacuse of reading data in volume
# RUN useradd -s /bin/bash user
# USER user

EXPOSE 3000
CMD [ "node", "dist/main.js" ]