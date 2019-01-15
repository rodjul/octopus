#
## Business_Ops_Role ##

### Role_Variables

variable "businessops" {
  default = "businessops"
}

variable "desc_businessops" {
  default = "This role is used to provide access to the Business Ops team responsible for Cost Management. It provides full access to AWS Billing and Portal and ReadOnly access to other resources."
}

### Business Ops Role
resource "aws_iam_role" "businessops" {
  provider = "aws.linked_account"
  name               = "${var.businessops}"
  description        = "${var.desc_businessops}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}


data "aws_iam_policy_document" "businessops" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.businessops}"
    actions   = ["aws-portal:*","awsbillingconsole:*","budgets:*","cur:*"]
    resources = ["*"]
    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values = "${var.intranetIP}"
    }
  }
}


resource "aws_iam_policy" "businessops" {
  provider = "aws.linked_account"
  name        = "policy-${var.businessops}"
  description = "${var.desc_businessops}"
  policy      = "${data.aws_iam_policy_document.businessops.json}"
}

resource "aws_iam_role_policy_attachment" "businessops" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.businessops.name}"
  policy_arn = "${aws_iam_policy.businessops.arn}"
}

output "businessops-role" {
  value = "${aws_iam_role.businessops.arn}"
}

#