#

## Variables ##
variable "cloudtrailid" {
    default = ""
}
variable "accountid" {
    default = ""
}
variable "payerid" {
    default = ""
}

## Providers ##
provider "aws" {
    alias = "cloudtrail"
    assume_role {
        role_arn     = "arn:aws:iam::${var.cloudtrailid}:role/octopus_svc"
        session_name = "Create-CommonSetup"
    }
    region = "sa-east-1"
}

provider "aws" {
    alias = "linked_account"
    assume_role {
        role_arn     = "arn:aws:iam::${var.accountid}:role/octopusmngt"
        session_name = "Create-CommonSetup"
    }
    region = "sa-east-1"
}

#
provider "aws" {
    alias = "payer"
    assume_role {
        role_arn     = "arn:aws:iam::${var.payerid}:role/octopus_svc"
        session_name = "AWS-Orgs"
    }
    region = "us-east-2"
}

#