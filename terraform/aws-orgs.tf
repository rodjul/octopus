#
## AWS Organizations Linked Accounts ##

### Accounts created with Terraform ###
resource "aws_organizations_account" "cloud104" {
  provider = "aws.payer"
  name  = "cloud104"
  email = "cloud104.aws@cloudtotvs.com.br"
  iam_user_access_to_billing = "ALLOW"
  role_name = "security"
}

output "cloud104_account_id" {
    value = "${aws_organizations_account.cloud104.id}"
}

resource "aws_organizations_account" "appdynamics" {
  provider = "aws.payer"
  name  = "appdynamics.aws"
  email = "appdynamics.aws@cloudtotvs.com.br"
  iam_user_access_to_billing = "ALLOW"
  role_name = "octopusmngt"
}

output "appdynamics_account_id" {
    value = "${aws_organizations_account.appdynamics.id}"
}

resource "aws_organizations_account" "servicecustomersnapshots" {
  provider = "aws.payer"
  name  = "service.customersnapshots.aws"
  email = "service.customersnapshots.aws@cloudtotvs.com.br"
  iam_user_access_to_billing = "ALLOW"
  role_name = "octopusmngt"
}

output "servicecustomersnapshots_account_id" {
    value = "${aws_organizations_account.servicecustomersnapshots.id}"
}

resource "aws_organizations_account" "tkssupplychain" {
  provider = "aws.payer"
  name  = "tks.supplychain.aws"
  email = "tks.supplychain.aws@cloudtotvs.com.br"
  iam_user_access_to_billing = "ALLOW"
  role_name = "security"
}

output "tkssupplychain_account_id" {
    value = "${aws_organizations_account.tkssupplychain.id}"
}

#