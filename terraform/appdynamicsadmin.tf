#
## AppDynamicsAdmin_Role ##
### AppDynamicsAdmin_Variables
variable "appdynamicsadmin" {
  default = "appdynamicsadmin"
}

variable "desc_appdynamicsadmin" {
  default = "This role is used to provide access to the appdynamicsadmin team."
}

### AppDynamics_Admin_Role
resource "aws_iam_role" "appdynamicsadmin" {
  provider = "aws.linked_account"
  name               = "${var.appdynamicsadmin}"
  description        = "${var.desc_appdynamicsadmin}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}


data "aws_iam_policy_document" "appdynamicsadmin" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.appdynamicsadmin}"
    actions   = ["s3:*","glacier:*"]
    resources = ["*"]
    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values = "${var.intranetIP}"
    }
  }
}

resource "aws_iam_policy" "appdynamicsadmin" {
  provider = "aws.linked_account"
  name        = "policy-${var.appdynamicsadmin}"
  description = "${var.desc_appdynamicsadmin}"

  policy      = "${data.aws_iam_policy_document.appdynamicsadmin.json}"
}

resource "aws_iam_role_policy_attachment" "appdynamicsadmin" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.appdynamicsadmin.name}"
  policy_arn = "${aws_iam_policy.appdynamicsadmin.arn}"
}

output "appdynamicsadmin-role" {
  value = "${aws_iam_role.appdynamicsadmin.arn}"
}

#