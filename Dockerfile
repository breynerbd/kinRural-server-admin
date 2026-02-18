FROM node:20

WORKDIR /usr/src

COPY kinRural-server-admin/package*.json ./kinRural-server-admin/
RUN cd kinRural-server-admin && npm install

COPY . .

WORKDIR /usr/src/kinRural-server-admin

EXPOSE 3005

CMD ["npm", "start"]
