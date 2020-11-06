#!/usr/bin/env bash
profile=$1
if [ -z $profile ]; then
	echo "Preciso do profile da aws como parametro. script.sh profile"
	exit 1
fi


aws lambda publish-layer-version --layer-name libgcp --compatible-runtimes python3.8 --zip-file fileb://libs/gcp.zip --profile $profile --region us-east-2 
aws lambda publish-layer-version --layer-name pythonjose --compatible-runtimes python3.8 --zip-file fileb://libs/pythonjose.zip --profile $profile --region us-east-2 
aws lambda publish-layer-version --layer-name requests --compatible-runtimes python3.8 --zip-file fileb://libs/requests.zip --profile $profile --region us-east-2 

#aws lambda publish-layer-version --layer-name $1 --compatible-runtimes python3.7 python3.8 --zip-file fileb://libs/gcp.zip --profile $2 --region us-east-2 
