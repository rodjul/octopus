#!/usr/bin/env bash
mkdir -p ../dist_$1/python
cp -R src/model ../dist_$1/python/
cd ../dist_$1
zip -r ../$1.zip .
aws lambda publish-layer-version --layer-name $1 --compatible-runtimes python3.7 python3.6 --zip-file fileb://../$1.zip --profile $2 --region us-east-2 
rm -rf ../$1.zip
rm -r ../dist_$1
