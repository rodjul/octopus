#
## CustomerSnapshotAdmin_Role ##
### CustomerSnapshotAdmin_Variables
variable "customersnapshotadmin" {
  default = "customersnapshotadmin"
}

variable "desc_customersnapshotadmin" {
  default = "This role is used to provide access to the customer snapshot team."
}

### CustomerSnapshotAdmin_Role
resource "aws_iam_role" "customersnapshotadmin" {
  provider = "aws.linked_account"
  name               = "${var.customersnapshotadmin}"
  description        = "${var.desc_customersnapshotadmin}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}


data "aws_iam_policy_document" "customersnapshotadmin" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.customersnapshotadmin}"
    actions   = ["s3:*","glacier:*","ec2:*","rds:*","kms:*"]
    resources = ["*"]
    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values = "${var.intranetIP}"
    }
  }
}

resource "aws_iam_policy" "customersnapshotadmin" {
  provider = "aws.linked_account"
  name        = "policy-${var.customersnapshotadmin}"
  description = "${var.desc_customersnapshotadmin}"

  policy      = "${data.aws_iam_policy_document.customersnapshotadmin.json}"
}

resource "aws_iam_role_policy_attachment" "customersnapshotadmin" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.customersnapshotadmin.name}"
  policy_arn = "${aws_iam_policy.customersnapshotadmin.arn}"
}

output "customersnapshotadmin-role" {
  value = "${aws_iam_role.customersnapshotadmin.arn}"
}

#