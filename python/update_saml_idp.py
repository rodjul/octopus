import boto3
from octopus import get_creds

def lambda_handler(event,context):
    saml_xml = event["saml_xml"]

    s3 = boto3.resource("s3")
    s3.meta.client.download_file(
        event["bucket_name"],
        "files/{}".format(saml_xml),
        '/tmp/{}'.format(saml_xml))

    saml_doc = open("/tmp/{}".format(saml_xml),"r")

    iam_client = get_creds(
        "iam",
        Id= event["Id"]
    )
    response = iam_client.update_saml_provider(
        SAMLMetadataDocument=str(saml_doc.read()),
        SAMLProviderArn="arn:aws:iam::{}:saml-provider/{}".format(event["Id"],event["idp_name"])
    )
    print(response)
    saml_doc.close()