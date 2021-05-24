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




class TestAwsAccountStatusCreation(unittest.TestCase):
    '''
    POST - /aws/accounts
    GET - /aws/accounts
    GET - /aws/accounts/{account_uid}/status
    GET - /aws/accounts/{account_uid}/accountid
    '''
    def test_no_500_error(self):
        r = doGET("/aws/accounts")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/accounts/542e1dca-d31c-4112-9ead-20afa310a31a/status")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/accounts/542e1dca-d31c-4112-9ead-20afa310a31a/accountid")
        self.assertNotIn(r.status_code, [500,502])
        pass


class TestAwsNetworkReport(unittest.TestCase):
    '''
    POST - /aws/networks/reports
    GET - /aws/networks/reports
    GET - /aws/networks/reports/{timestamp}/{type_request}
    '''
    def test_no_500_error(self):
        r = doGET("/aws/networks/reports")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/networks/reports/1/1")
        self.assertNotIn(r.status_code, [500,502])
        pass


class TestAwsRoles(unittest.TestCase):
    '''
    GET - /aws/roles
    PUT - /aws/roles
DELETE - /aws/roles/{role_type}
    '''
    def test_no_500_error(self):
        r = doGET("/aws/roles")
        self.assertNotIn(r.status_code, [500,502])
        pass


class TestAwsPolicies(unittest.TestCase):
    '''
    GET - /aws/policies
    GET - /aws/policies/{policy_type}
    DELETE - /aws/policies/{policy_type}/{policy_name}
    PUT - /aws/policies
    '''
    def test_no_500_error(self):
        r = doGET("/aws/policies")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/policies/aaa")
        self.assertNotIn(r.status_code, [500,502])
        pass


class TestAwsPoliciesCompliances(unittest.TestCase):
    '''
    POST - /aws/policiescompliance/cis
    GET - /aws/policiescompliance/cis/status
    GET - /aws/policiescompliance/cis/check
    GET - /aws/policiescompliance/cis/dates-available
    '''
    def test_no_500_error(self):
        r = doGET("/aws/policiescompliance/cis/status")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/policiescompliance/cis/check")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/policiescompliance/cis/dates-available")
        self.assertNotIn(r.status_code, [500,502])
        pass


class TestAwsIamCompliances(unittest.TestCase):
    '''
    POST - /aws/policiescompliance/iam
    GET - /aws/policiescompliance/iam/status
    GET - /aws/policiescompliance/iam/check
    GET - /aws/policiescompliance/iam/dates-available
    '''
    def test_no_500_error(self):
        r = doGET("/aws/policiescompliance/iam/status")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/policiescompliance/iam/check")
        self.assertNotIn(r.status_code, [500,502])
        r = doGET("/aws/policiescompliance/iam/dates-available")
        self.assertNotIn(r.status_code, [500,502])
        pass




if __name__ == '__main__':
    unittest.main()


