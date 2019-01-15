#
## Variable ##
variable "cloudtrail" {}

## Enables Cloudtrail logging for linked account ##

resource "aws_cloudtrail" "cloudtrail" {
  provider = "aws.linked_account"
  name = "${var.cloudtrail}"
  s3_bucket_name = "${var.cloudtrail}"
  is_multi_region_trail = true
}

#