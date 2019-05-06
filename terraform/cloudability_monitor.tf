#
## Creates Cross Account Role
### Variables
variable "cloudability" {
  default = "Cloudability"
}

variable "desc_cloudability" {
  default = "This role is used to provide access to cloudability."
}

variable "cloudability_account_id" {
  default = "165736516723"
}

variable "cloudability_externalId" {
  type    = "map"
}

data "aws_iam_policy_document" "trust_cloudability" {
  provider = "aws.linked_account"
  statement {
    sid     = "assume${var.cloudability}"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${var.cloudability_account_id}:user/cloudability"]
    }

    condition {
      test     = "StringEquals"
      variable = "sts:ExternalId"
      values   = ["${var.cloudability_externalId[var.accountid]}"]
    }
  }
}

### Mngt Cross Account
resource "aws_iam_role" "cloudability" {
  provider = "aws.linked_account"
  name               = "${var.cloudability}Role"
  description        = "${var.desc_cloudability}"
  assume_role_policy = "${data.aws_iam_policy_document.trust_cloudability.json}"
}

data "aws_iam_policy_document" "cloudability" {
  provider = "aws.linked_account"
  statement {
    sid       = "${var.cloudability}"
    actions   = [
      "iam:SimulatePrincipalPolicy",
      "cloudwatch:GetMetricStatistics",
      "dynamodb:DescribeTable",
      "dynamodb:ListTables",
      "ec2:DescribeImages",
      "ec2:DescribeInstances",
      "ec2:DescribeRegions",
      "ec2:DescribeReservedInstances",
      "ec2:DescribeReservedInstancesModifications",
      "ec2:DescribeSnapshots",
      "ec2:DescribeVolumes",
      "ec2:GetReservedInstancesExchangeQuote",
      "ecs:DescribeClusters",
      "ecs:DescribeContainerInstances",
      "ecs:ListClusters",
      "ecs:ListContainerInstances",
      "elasticache:DescribeCacheClusters",
      "elasticache:DescribeReservedCacheNodes",
      "elasticache:ListTagsForResource",
      "elasticmapreduce:DescribeCluster",
      "elasticmapreduce:ListClusters",
      "elasticmapreduce:ListInstances",
      "rds:DescribeDBClusters",
      "rds:DescribeDBInstances",
      "rds:DescribeReservedDBInstances",
      "rds:ListTagsForResource",
      "redshift:DescribeClusters",
      "redshift:DescribeReservedNodes",
      "redshift:DescribeTags"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "cloudability" {
  provider = "aws.linked_account"
  name        = "policy-${var.cloudability}"
  description = "${var.desc_cloudability}"

  policy      = "${data.aws_iam_policy_document.cloudability.json}"
}

resource "aws_iam_role_policy_attachment" "cloudability" {
  provider = "aws.linked_account"
  role       = "${aws_iam_role.cloudability.name}"
  policy_arn = "${aws_iam_policy.cloudability.arn}"
}

output "cloudability-role" {
  value = "${aws_iam_role.cloudability.arn}"
}

#