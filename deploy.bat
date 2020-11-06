set profile=%1

if profile == [] (
    echo "PRofile is missing"
    exit /b
)

REM sls -c src/serverless_resources.yml deploy --stage dev --profile <profile>
REM sls -c src/apigateway/serverless_functions.yml deploy --stage dev --profile <profile>
REM sls -c src/sqs/serverless_sqs.yml deploy --stage dev --profile <profile>
REM sls -c src/crontab/serverless_crontab.yml deploy --stage dev --profile <profile>
REM sls -c public/serverless_frontend.yml deploy --stage dev --profile <profile>
