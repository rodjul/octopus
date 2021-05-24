#!/bin/bash
profile=$1
stage=$2
if [ -z $profile ]; then
    echo "Erro: $0 <profile>";
    exit
fi
if [ -z $stage ]; then
    echo "Error: inform stage dev prod";
    exit
fi

# base resources to make octopus work
echo "Deploying base resources"
cd src/
echo "Deploying: src/serverless_base_functions.yml"
sls -c serverless_base_functions.yml deploy --stage $stage --profile $profile
# echo "Deploying: src/serverless_base_resources.yml"
# sls -c serverless_base_resources.yml deploy --stage $stage --profile $profile
cd ../

# aws
echo "Deploying aws resources"
cd src/providers/aws/
# echo "Deploying: src/providers/aws/serverless_aws_resources.yml"
# sls -c serverless_aws_resources.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/aws/serverless_sqs.yml"
sls -c serverless_sqs.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/aws/serverless_sns.yml"
sls -c serverless_sns.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/aws/serverless_aws_functions.yml"
sls -c serverless_aws_functions.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/aws/serverless_crontab.yml"
sls -c serverless_crontab.yml deploy --stage $stage --profile $profile
cd ../../../

# gcp
echo "Deploying gcp resources"
cd src/providers/gcp/
# echo "Deploying: src/providers/gcp/serverless_gcp_resources.yml"
# sls -c serverless_gcp_resources.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/gcp/serverless_sqs.yml"
sls -c serverless_sqs.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/gcp/serverless_gcp_functions.yml"
sls -c serverless_gcp_functions.yml deploy --stage $stage --profile $profile
echo "Deploying: src/providers/gcp/serverless_crontab.yml"
sls -c serverless_crontab.yml deploy --stage $stage --profile $profile
cd ../../../


# sls -c public/serverless_frontend.yml deploy --stage $stage --profile $profile
