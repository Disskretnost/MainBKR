FROM ubuntu:22.04 as dev

# Устанавливаем Node.js и необходимые зависимости
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  build-essential \
  python3 \
  python3-pip \
  ffmpeg \
  && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean

# Устанавливаем рабочую директорию
WORKDIR /opt/server


COPY package.json ./

RUN npm install -g node-pre-gyp
    
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
