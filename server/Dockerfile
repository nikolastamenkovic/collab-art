FROM node:16

# Postavljamo radni direktorijum unutar kontejnera
WORKDIR /usr/src/app

# Kopiramo package.json i instaliramo zavisnosti
COPY package.json .
RUN npm install

# Kopiramo ceo projekat
COPY . .

# Kompajliramo TypeScript kod
RUN npm run build

# Eksponiramo port aplikacije
EXPOSE 3000

# Pokrećemo aplikaciju
CMD ["node", "dist/app.js"]