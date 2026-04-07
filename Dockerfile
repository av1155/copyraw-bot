FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
CMD ["sh", "-c", "[ \"$REGISTER_COMMANDS\" = \"1\" ] && node deploy-commands.js; exec node index.js"]
