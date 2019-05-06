#
## Lions_Platform_Role ##
### Lions_Platform_Variables
variable "lionsplatform" {
  default = "lionsplatform"
}

variable "desc_lionsplatform" {
  default = "This role is used to provide access to the Lions Platform team responsible for the Platform that deploys Image Products. It provides full access to most resources on AWS except the ones used to elevate privileges or alter logs or billing."
}

### Lions Platform Role

resource "aws_iam_role" "lionsplatform" {
  provider = "aws.linked_account"
  name               = "${var.lionsplatform}"
  description        = "${var.desc_lionsplatform}"
  assume_role_policy = "${data.aws_iam_policy_document.policy_assume_saml.json}"
}


data "aws_iam_policy_document" "lionsplatform" {
  provider = "aws.linked_account"
  statement {
    sid = "${var.lionsplatform}DenyStopDeleteCloudtrail"
    effect = "Deny"
    actions = ["cloudtrail:CreateTrail","cloudtrail:DeleteTrail","cloudtrail:StopLogging","cloudtrail:UpdateTrail"]
    resources = ["*"]
  },
  statement {
    sid = "${var.lionsplatform}DenyWRITEPortal"
    effect = "Deny"
    actions = ["aws-portal:ModifyAccount","aws-portal:ModifyBilling","aws-portal:ModifyPaymentMethods"]
    resources = ["*"]
  },
  statement {
    sid = "${var.lionsplatform}DenyWriteIAM"
    effect = "Deny"
    actions = [
        "iam:AddUserToGroup",
                "iam:AttachGroupPolicy",
                "iam:AttachUserPolicy",
                "iam:CreateGroup",
                "iam:CreateLoginProfile",
                "iam:CreateSAMLProvider",
                "iam:CreateUser",
                "iam:DeactivateMFADevice",
                "iam:DeleteAccountPasswordPolicy",
                "iam:DeleteGroup",
                "iam:DeleteGroupPolicy",
                "iam:DeleteLoginProfile",
                "iam:DeletePolicy",
                "iam:DeletePolicyVersion",
                "iam:DeleteSAMLProvider",
                "iam:DeleteSSHPublicKey",
                "iam:DeleteSigningCertificate",
                "iam:DeleteUser",
                "iam:DeleteUserPolicy",
                "iam:DetachGroupPolicy",
                "iam:DetachUserPolicy",
                "iam:PutGroupPolicy",
                "iam:PutUserPolicy",
                "iam:RemoveUserFromGroup",
                "iam:UpdateAccountPasswordPolicy",
                "iam:UpdateAssumeRolePolicy",
                "iam:UpdateGroup",
                "iam:UpdateLoginProfile",
                "iam:UpdateSAMLProvider",
                "iam:UpdateSSHPublicKey",
                "iam:UpdateSigningCertificate",
                "iam:UpdateUser",
                "iam:UploadSSHPublicKey",
                "iam:UploadSigningCertificate"
    ]
    resources = ["*"]
  },
  statement {
    sid = "${var.lionsplatform}DenyChangeManagedRoles"
    effect = "Deny"
    actions = [
        "iam:AttachRolePolicy",
        "iam:CreatePolicy",
        "iam:CreatePolicyVersion",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:SetDefaultPolicyVersion"]
    resources = [
        "arn:aws:iam::*:role/accessmngt",
        "arn:aws:iam::*:role/supportportal",
        "arn:aws:iam::*:role/businessops",
        "arn:aws:iam::*:role/lionsplatform",
        "arn:aws:iam::*:role/devopsplatform"
    ]
  },
  statement {
    sid = "${var.lionsplatform}AllowFromIntranet"
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


resource "aws_iam_policy" "lionsplatform" {
  provider = "aws.linked_account"
  name        = "policy-${var.lionsplatform}"
  description = "${var.desc_lionsplatform}"
  policy      = "${data.aws_iam_policy_document.lionsplatform.json}"
}

resource "aws_iam_role_policy_attachment" "lionsplatform" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.lionsplatform.name}"
  policy_arn = "${aws_iam_policy.lionsplatform.arn}"
}

output "lionsplatform-role" {
  value = "${aws_iam_role.lionsplatform.arn}"
}

#