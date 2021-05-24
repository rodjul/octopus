import requests
import unittest

URL = "https://tmjzvttr4c.execute-api.us-east-2.amazonaws.com/dev"
AUTHORIZATION = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiI0NTI1MzVhYi05OWUxLTRlZjEtYWJmMi05YjFhM2FhNTlkNTciLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82ODNjNjk0NC1iMmJlLTRmNzgtOTA3YS00MzdhYzI5MTYyNzYvIiwiaWF0IjoxNjA2MjUyNjczLCJuYmYiOjE2MDYyNTI2NzMsImV4cCI6MTYwNjI1NjU3MywiYWlvIjoiQVVRQXUvOFJBQUFBQ3VaSW9KbkFTelh2cko5TEtGeGFueUtjSUhaRXF0VFJ0SFlIeWVRb3F6aUtaNldnNEszbEdzb3JNaTZqQy9vRXNKbDJYUEF2ZGpydXFuWExKMGJheUE9PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiZmFtaWx5X25hbWUiOiJNYXNjZWxsYXJvIGUgU2lsdmEiLCJnaXZlbl9uYW1lIjoiUm9kcmlnbyBKdWxpYW5vIiwiaXBhZGRyIjoiMTUyLjI1NC4xMzYuMTczIiwibmFtZSI6IlJvZHJpZ28gSnVsaWFubyBNYXNjZWxsYXJvIGUgU2lsdmEiLCJub25jZSI6IjMxNzJkZDYzLTBkY2MtNDE4NS1iYmEyLTQ0ZjM0ZDg1MDA0MiIsIm9pZCI6Ijg0NWViNDA3LTg1ZjYtNDA5NS1iZTQ0LTAwNWYyNTJjODU3MiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS03Njg3OTc2MDgtMzY3MzI2MTE5MC0zODg0MDkzNzgyLTg0MjUiLCJyaCI6IjAuQUFBQVJHazhhTDZ5ZUUtUWVrTjZ3cEZpZHFzMUpVWGhtZkZPcV9LYkdqcWxuVmMwQURjLiIsInN1YiI6InExbHpOUU8xTWhBOHg5cTNjYTVhRU9NWmhma0NKdEU0VHBkRzVjSWNpWFEiLCJ0aWQiOiI2ODNjNjk0NC1iMmJlLTRmNzgtOTA3YS00MzdhYzI5MTYyNzYiLCJ1bmlxdWVfbmFtZSI6InJvZHJpZ28uanVsaWFub0BjbG91ZHRvdHZzLmNvbS5iciIsInVwbiI6InJvZHJpZ28uanVsaWFub0BjbG91ZHRvdHZzLmNvbS5iciIsInV0aSI6Ijg1VXJjZnlTcTBxc0lfQW9JS2hhQUEiLCJ2ZXIiOiIxLjAifQ.i5KomFFmDntUCuf0ghX494WCatsz7kvHvBb4HoXmonLrEFToQVDPuNNvq_sRGJvQqtWbwOo88mIeqUd1YbK1x4T2T5IrYVxArosx3GEfxielp_I3NUTRLWrC2Oj-Qzmg9QohDaVkbiAJM-TxDqbX99s_scGrDnWcyXkvkqgA5hILLFDba1JkV_jypOQL141NOO2ceefnSgLg8-t_waubNpoI-QZLrPqEzT0THMmthbf2kfbUcGCKVAJc85JOU0hSx4ykA68IUPECPaRBQjugKy0BkUY6lq9uBMkZe_qf-jMKop0yoZmfK9AxyDSIrpNMYmWzRoPOZ-XBTTcpkMKY2A"

def doGET(endpoint, args={}):
    return requests.get(URL+endpoint, headers={"Content-Type":"application/json", "Authorization":AUTHORIZATION})

def doPOST(endpoint, data, args):
    return requests.post(URL+endpoint, data=data, args=args, headers={"Content-Type":"application/json", "Authorization":AUTHORIZATION})

def doPUT(endpoint, data, args):
    return requests.put(URL+endpoint, data=data, args=args, headers={"Content-Type":"application/json", "Authorization":AUTHORIZATION})

def doDELETE(endpoint, data, args):
    return requests.delete(URL+endpoint, data=data, args=args, headers={"Content-Type":"application/json", "Authorization":AUTHORIZATION})




class TestGcpOrganizations(unittest.TestCase):
    '''
    GET - /gcp/organizations
    POST - /gcp/organizations/folders
    POST - /gcp/organizations/projects
    GET - /gcp/organizations/logs
    '''
    def test_no_500_error(self):
        r = doGET("/gcp/organizations")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/gcp/organizations/logs")
        self.assertNotIn(r.status_code, [500,502])
        pass


class TestGcpOrganizationsIamProject(unittest.TestCase):
    '''
    GET - /gcp/iam/projects
  POST - /gcp/iam/projects/{resourceName}
  POST - /gcp/accountapi/metadata
  
    '''
    def test_no_500_error(self):
        r = doGET("/gcp/iam/projects")
        self.assertNotIn(r.status_code, [500,502])
        pass





if __name__ == '__main__':
    unittest.main()


