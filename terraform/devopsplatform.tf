#
## Devops_Platform_Role ##
### Devops_Platform_Variables
variable "devopsplatform" {
  default = "devopsplatform"
}

variable "desc_devopsplatform" {
  default = "This role is used to provide access to the Devops Platform team responsible for Kubernetes Cluster. It provides full access to most resources on AWS."
}

variable "intranetIP" {}


### Devops Platform Role

resource "aws_iam_role" "devopsplatform" {
  provider = "aws.linked_account"
  name               = "${var.devopsplatform}"
  description        = "${var.desc_devopsplatform}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}


data "aws_iam_policy_document" "devopsplatform" {
  provider = "aws.linked_account"
  statement {
    sid = "${var.devopsplatform}-Deny-STOP_DELETE-Cloudtrail"
    effect = "Deny"
    actions = ["cloudtrail:CreateTrail","cloudtrail:DeleteTrail","cloudtrail:StopLogging","cloudtrail:UpdateTrail"]
    resources = ["*"]
  },
  statement {
    sid = "${var.devopsplatform}-Deny-WRITE-Portal"
    effect = "Deny"
    actions = ["aws-portal:ModifyAccount","aws-portal:ModifyBilling","aws-portal:ModifyPaymentMethods"]
    resources = ["*"]
  },
  statement {
    sid = "${var.devopsplatform}-Allow-from-Intranet"
    effect = "Allow"
    actions = ["*"]
    resources = ["*"]
    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"
      values = "${var.intranetIP}"
    } 
  }
}


resource "aws_iam_policy" "devopsplatform" {
  provider = "aws.linked_account"
  name        = "policy-${var.devopsplatform}"
  description = "${var.desc_devopsplatform}"
  policy      = "${data.aws_iam_policy_document.devopsplatform.json}"
}

resource "aws_iam_role_policy_attachment" "devopsplatform" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.devopsplatform.name}"
  policy_arn = "${aws_iam_policy.devopsplatform.arn}"
}

output "devopsplatform-role" {
  value = "${aws_iam_role.devopsplatform.arn}"
}

#