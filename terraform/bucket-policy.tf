#
## Generates bucket policy of cloudtrail bucket with new account ids ##

data "aws_iam_policy_document" "cloudtrail" {
  provider = "aws.cloudtrail"
  statement {
    sid       = "AWSCloudTrailAclCheck20150319"
    actions   = ["s3:GetBucketAcl"]
    resources = ["arn:aws:s3:::${var.cloudtrail}"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
  statement {
    sid       = "AWSCloudTrailWrite20150319"
    actions   = ["s3:PutObject"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"

      values = [
        "bucket-owner-full-control",
      ]
    }
    resources = "${var.accountids_cloudtrail}"
  }
}



#