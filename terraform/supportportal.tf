#
## Support_Portal_Role ##
### Support_Portal_Variables

variable "supportportal" {
  default = "supportportal"
}

variable "desc_supportportal" {
  default = "This role is used to provide access to the Support Portal on AWS. It provides full access to Support Portal."
}

### Support Portal Role
resource "aws_iam_role" "supportportal" {
  provider = "aws.linked_account"
  name               = "${var.supportportal}"
  description        = "${var.desc_supportportal}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}

data "aws_iam_policy_document" "supportportal" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.supportportal}"
    actions   = ["support:*"]
    resources = ["*"]
    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values = "${var.intranetIP}"
    }
  }
}


resource "aws_iam_policy" "supportportal" {
  provider = "aws.linked_account"
  name        = "policy-${var.supportportal}"
  description = "${var.desc_supportportal}"
  policy      = "${data.aws_iam_policy_document.supportportal.json}"
}

resource "aws_iam_role_policy_attachment" "supportportal" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.supportportal.name}"
  policy_arn = "${aws_iam_policy.supportportal.arn}"
}

output "supportportal-role" {
  value = "${aws_iam_role.supportportal.arn}"
}

#