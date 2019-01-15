variable "accesskey" {}
variable "secretkey" {}

variable "id" {}

provider "aws" {
alias = "linked_account"
access_key = "${var.accesskey}"
secret_key = "${var.secretkey}"
assume_role {
    role_arn     = "arn:aws:iam::${var.id}:role/security"
    session_name = "Create-Cross-Account-Role"
}
region = "us-east-2"
}