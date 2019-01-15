#
## Access_Management_Role ##

### Role_Variables

variable "accessmngt" {
  default = "accessmngt"
}

variable "desc_accessmngt" {
  default = "This role is used to provide access to the Security team responsible for IDM. It provides full access to AWS IAM and ReadOnly access to other resources."
}


### Access Management Role
resource "aws_iam_role" "accessmngt" {
  provider = "aws.linked_account"
  name               = "${var.accessmngt}"
  description        = "${var.desc_accessmngt}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}


data "aws_iam_policy_document" "accessmngt" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.accessmngt}"
    actions   = ["iam:*","cloudtrail:*"]
    resources = ["*"]
    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values = "${var.intranetIP}"
    }
  }
}

resource "aws_iam_policy" "accessmngt" {
  provider = "aws.linked_account"
  name        = "policy-${var.accessmngt}"
  description = "${var.desc_accessmngt}"

  policy      = "${data.aws_iam_policy_document.accessmngt.json}"
}

resource "aws_iam_role_policy_attachment" "accessmngt" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.accessmngt.name}"
  policy_arn = "${aws_iam_policy.accessmngt.arn}"
}

output "accessmngt-role" {
  value = "${aws_iam_role.accessmngt.arn}"
}

#