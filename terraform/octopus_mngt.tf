#
## Creates Cross Account Role
### Variables
variable "octopusmngt" {
  default = "octopusmngt"
}

variable "desc_octopusmngt" {
  default = "This role is used to provide access to Octopus from the management account."
}

variable "mngt_account_id" {}

#variable "externalId" {}

data "aws_iam_policy_document" "trust_cross_account" {
  provider = "aws.linked_account"
  statement {
    sid     = "assume-${var.octopusmngt}"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.mngt_account_id}:root"]
    }

    # condition {
    #   test     = "StringEquals"
    #   variable = "sts:ExternalId"
    #   values   = ["${var.externalId}"]
    # }
  }
}

### Mngt Cross Account
resource "aws_iam_role" "octopusmngt" {
  provider = "aws.linked_account"
  name               = "${var.octopusmngt}"
  description        = "${var.desc_octopusmngt}"
  assume_role_policy = "${data.aws_iam_policy_document.trust_cross_account.json}"
}

data "aws_iam_policy_document" "octopusmngt" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.octopusmngt}"
    actions   = ["iam:*","cloudtrail:*"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "octopusmngt" {
  provider = "aws.linked_account"
  name        = "policy-${var.octopusmngt}"
  description = "${var.desc_octopusmngt}"

  policy      = "${data.aws_iam_policy_document.octopusmngt.json}"
}

resource "aws_iam_role_policy_attachment" "octopusmngt" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.octopusmngt.name}"
  policy_arn = "${aws_iam_policy.octopusmngt.arn}"
}

output "octopusmngt-role" {
  value = "${aws_iam_role.octopusmngt.arn}"
}

#