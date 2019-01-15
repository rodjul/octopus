#
## backend ##

terraform {
  backend "s3" {
    key = "backend"
    workspace_key_prefix = "workspace"
    encrypt=true
    region = "us-east-2"
  }
}

#