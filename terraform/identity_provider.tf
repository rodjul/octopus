#
## Creates an Identity Provider for SAML Federation ##
### Idenity_Provider_Variables

variable "saml_IdP" {
  default = "ADFS"
}

variable "saml_metadata" {
  default = "FederationMetadata.xml"
}

### Add SAML Federated Identity Provider
resource "aws_iam_saml_provider" "saml_federation" {
  provider = "aws.linked_account"
  name                   = "${var.saml_IdP}"
  saml_metadata_document = "${file("${var.saml_metadata}")}"
}

output "saml_provider_arn" {
  value = "${aws_iam_saml_provider.saml_federation.arn}"
}

data "aws_iam_policy_document" "policy_assume_saml" {
  provider = "aws.linked_account"
  statement {
    sid     = "${var.saml_IdP}"
    actions = ["sts:AssumeRoleWithSAML"]

    principals {
      type        = "Federated"
      identifiers = ["${aws_iam_saml_provider.saml_federation.arn}"]
    }

    condition {
      test     = "StringEquals"
      variable = "SAML:aud"
      values   = ["https://signin.aws.amazon.com/saml"]
    }
  }
}

#