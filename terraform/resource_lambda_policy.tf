#
## Policy Document for Lambda Service as a Trusted Entity ##
data "aws_iam_policy_document" "resource_lambda" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

#