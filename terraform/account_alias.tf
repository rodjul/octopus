#
## Variable ##
variable "company_name" {}

## Set alias for account
resource "aws_iam_account_alias" "account_alias" {
  provider = "aws.linked_account"
  account_alias = "${var.account_alias}-${var.company_name}"
}

#