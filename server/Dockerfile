FROM node:20

# Postavljamo radni direktorijum unutar kontejnera
WORKDIR /usr/src/app

# Kopiramo package.json i instaliramo zavisnosti
COPY package.json .
RUN npm install

# Kopiramo ceo projekat
COPY . .

# Build-ujemo vue aplikaciju
RUN npm run build

# Eksponiramo port aplikacije
EXPOSE 3001

# Pokrećemo aplikaciju
CMD ["node", "dist/app.js"]