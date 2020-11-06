https://stackoverflow.com/a/53833423

Files priority:

npm start: .env.development.local, .env.development, .env.local, .env

npm run build: .env.production.local, .env.production, .env.local, .env

npm test: .env.test.local, .env.test, .env (note .env.local is missing)

