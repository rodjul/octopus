#!/bin/bash

profile=$1
cloudfrontID=""


if [ -z $profile ]; then
    echo "Missing profile"
    echo "$0 profile123"
    exit 1;
fi

echo "[REACT] Build REACT"
npm run build

echo "[S3] Updating bucket content"
aws s3 sync ./build/ s3://octopus-site-prod/ --delete --profile $profile

echo "[CLOUDFRONT] Creating invalidation"
aws cloudfront create-invalidation --distribution-id $cloudfrontID --paths "/*" --profile $profile