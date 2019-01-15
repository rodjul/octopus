import boto3
import octopus
from os import environ

def create_group(items):
    groups = ''
    for item in items:
        groups += '''

        ''' + '''
resource "aws_iam_group" "%s" {
  provider = "aws.linked_account"
  name = "%s"
}
''' % (item,item)
    return groups

def create_user(items):
    users = ''
    for item in items:
        users += '''

        ''' + '''
resource "aws_iam_user" "%s" {
  provider = "aws.linked_account"
  name = "%s"
  force_destroy = true
  tags = {
    managedby = "octopus"
  }
}
''' % (item,item)
    return users

def attach_users_to_group(items):
    membership = ''
    for item in items:
        for key,values in item.items():
            users = []
            for i in values:
                users.append("${aws_iam_user.%s.name}" % i)

            membership +='''

        ''' + '''
resource "aws_iam_group_membership" "%s" {
  provider = "aws.linked_account"
  name = "%s-membership"

  users = %s

  group = "${aws_iam_group.%s.name}"
}
''' % (key,key,users,key)

    return membership

def create_policy_resource(items):
    policy = ''
    for item in items:
        policy += '''

'''+'''
resource "aws_iam_policy" "%s" {
  provider = "aws.linked_account"
  name        = "policy-%s"

  policy      = "${data.aws_iam_policy_document.%s.json}"
}
''' % (item['policy_name'],item['policy_name'],item['policy_name'])

    return policy

def create_policy_document(items):
    policy_doc = ''
    for item in items:
        condition = ''
        if 'condition' in item:
            condition = '''
condition {
    test     = "%s"
    variable = "%s"
    values = %s
}
''' % (
            item['condition']['test'],
            item['condition']['variable'],
            item['condition']['values']) 
        policy_doc += '''

'''+'''
data "aws_iam_policy_document" "%s" {
  provider = "aws.linked_account"
  statement {
    sid       = "%s"
    actions   = %s
    resources = %s
''' % (
    item['policy_name'],
    item['sid'],
    item['actions'],
    item['resources']) + condition + '''   
  }
}

'''


def attach_policy_to_group(items):
    policy_document = ''
    for item in items:
        if 'user' in item:
            for policy in item['policy']:
                policy_document += '''

''' + '''
resource "aws_iam_user_policy_attachment" "%s" {
  provider = "aws.linked_account"
  user      = "${aws_iam_user.%s.name}"
  policy_arn = "${aws_iam_policy.%s.arn}"
}
''' % (item['user'],item['user'],policy)

        if 'group' in item:
            for policy in item['policy']:
                policy_document += '''

''' + '''
resource "aws_iam_group_policy_attachment" "%s" {
  provider = "aws.linked_account"
  group      = "${aws_iam_group.%s.name}"
  policy_arn = "${aws_iam_policy.%s.arn}"
}
''' % (item['group'],item['group'],policy)
    return policy_document

#############

def lambda_handler(event, context):
    print('message received on function trigger: %s' % event)
    if octopus.validate_event_data(event):
        tf_document = '''
%s

%s

%s

%s

%s

%s
    ''' % (
            create_group(event['groups']),
            create_user(event['users']),
            attach_users_to_group(event['membership']),
            create_policy_document(event['policy']),
            create_policy_resource(event['policy']),
            attach_policy_to_group(event['policy_attachment']))
        f = open("/tmp/%s_users-groups.tf" % event['Environment'], "w")
        f.write(tf_document)
        f.close()
        s3_client = boto3.client('s3')
        put_file = s3_client.put_object(
            Body='/tmp/%s_users-groups.tf' % event['Environment'],
            Bucket=environ['terraform_config_bucket'],
            Key='files/%s_users-groups.tf' % event['Environment']
        )
        print(put_file)
        return put_file
