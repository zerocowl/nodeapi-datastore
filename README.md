# API V4


## install dependencies
```sh
$ npm install
```

## Running Locally (DEV ENV)
- Assert that you've Google Datastore key JSON, put it into src/config/gcloud-servicekey.json
- Assert that you have all var envs in a file called .env.dev

so run on cli: 
```sh
$ npm run start:dev
```

It will run over pm2 

By default, it's running over port 8082

check the access requesting
```sh
curl http://localhost:8082/api/health
```

If everything is ok, You will see as following:
```sh
{
    "status": 200,
    "message": "success on api connect"
}
```