#
## Updates bucket policy of cloudtrail bucket with new account ids ##
data "aws_s3_bucket" "cloudtrail" {
  provider = "aws.cloudtrail"
  bucket = "${var.cloudtrail}"
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  provider = "aws.cloudtrail"
  bucket = "${data.aws_s3_bucket.cloudtrail.id}"
  policy = "${data.aws_iam_policy_document.cloudtrail.json}"
}

#