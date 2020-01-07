# octopus
A simple project to create and control terraform configuration on a multi-account aws environment




## How to deploy application (using serverless)

```shell script
sls deploy -v --stage dev  #to dev
sls deploy -v --stage prod #to prod
```

## Update lambda layer
```shell script
update_layer.sh name_of_model profile_aws
```

## Get plugins
```
npm install serverless-plugin-log-retention #install local
npm install serverless-s3-sync #install local https://github.com/k1LoW/serverless-s3-sync
```


## Built With
- [Python](https://www.python.org/)
- [Serverless](https://serverless.com/)
- [AWS Lambda](https://aws.amazon.com/lambda/)

## License

