# -*- coding: iso-8859-15 -*-
""" 
Copyright 2011 © Ooyala, Inc.  All rights reserved.

  Ooyala, Inc. ("Ooyala") hereby grants permission, free of charge, to any person or entity obtaining a copy of the software code provided in source code format via this webpage and direct links contained within this webpage and any associated documentation (collectively, the "Software"), to use, copy, modify, merge, and/or publish the Software and, subject to pass-through of all terms and conditions hereof, permission to transfer, distribute and sublicense the Software; all of the foregoing subject to the following terms and conditions:

  1.  The above copyright notice and this permission notice shall be included in all copies or portions of the Software.

  2.   For purposes of clarity, the Software does not include any APIs, but instead consists of code that may be used in conjunction with APIs that may be provided by Ooyala pursuant to a separate written agreement subject to fees.  

  3.   Ooyala may in its sole discretion maintain and/or update the Software.  However, the Software is provided without any promise or obligation of support, maintenance or update.  

  4.  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, RELATING TO, ARISING FROM, IN CONNECTION WITH, OR INCIDENTAL TO THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  5.   TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, (i) IN NO EVENT SHALL OOYALA BE LIABLE FOR ANY CONSEQUENTIAL, INCIDENTAL, INDIRECT, SPECIAL, PUNITIVE, OR OTHER DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF BUSINESS PROFITS, BUSINESS INTERRUPTION, LOSS OF BUSINESS INFORMATION, OR OTHER PECUNIARY LOSS) RELATING TO, ARISING FROM, IN CONNECTION WITH, OR INCIDENTAL TO THE SOFTWARE OR THE USE OF OR INABILITY TO USE THE SOFTWARE, EVEN IF OOYALA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND (ii) OOYALA'S TOTAL AGGREGATE LIABILITY RELATING TO, ARISING FROM, IN CONNECTION WITH, OR INCIDENTAL TO THE SOFTWARE SHALL BE LIMITED TO THE ACTUAL DIRECT DAMAGES INCURRED UP TO MAXIMUM AMOUNT OF FIFTY DOLLARS ($50).
""" 

import hashlib, base64, urllib, httplib, time, logging, json

HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']    
DEFAULT_EXPIRATION_WINDOW = 15
DEFAULT_ROUND_UP_TIME = 300
API_VERSION = 'v2'
DEFAULT_BASE_URL = 'api.ooyala.com'
DEFAULT_CACHE_BASE_URL = 'cdn-api.ooyala.com'

logging.basicConfig(format='',level=logging.INFO)

class OoyalaAPI(object):
    def __init__(self, 
                api_key,
                secret_key,
                base_url=DEFAULT_BASE_URL,
                cache_base_url=DEFAULT_CACHE_BASE_URL,
                expiration=DEFAULT_EXPIRATION_WINDOW):
        """OoyalaAPI Constructor
        
        Type signature:
            (str, str, str:DEFAULT_BASE_URL, int:DEFAULT_EXPIRATION_WINDOW) -> OoyalaAPI
        Parameters:
            api_key    - The API key
            secret_key - The secret key
            base_url   - the url's base
            expiration - the expiration window, in seconds
        Example:
            api = OoyalaAPI("..", "..")
        """
        self._secret_key = secret_key
        self._api_key = api_key
        self._base_url = base_url
        self._cache_base_url = cache_base_url
        self._expiration_window = expiration
        self._response_headers = [()]

    def send_request(self, http_method, relative_path, body=None, params={}):
        """Send a request.
        
        Type signature:
            (str, str, str:None, dict:{}) -> json str | None
        Parameters:
            http_method   - the http method
            relative_path - the url's relative path
            body          - the request's body
            params        - the query parameters
        Example:
            api = OoyalaAPI(secret_key, api_key)
            response = api.send_request('GET', 'players/2kj390')
            response = api.send_request('PATCH', 'players/2kj390', "{'name': 'my new player name'}")
        """
        # create the url
        path = '/%s/%s' % (API_VERSION,relative_path)
        
        # Convert the body to JSON format
        json_body = ''
        if (body is not None):
            json_body = json.dumps(body) if type(body) is not str else body

        url = self.build_path_with_authentication_params(http_method, path, params, json_body)
        if url is None:
            return None
        
        base_url = self.base_url if http_method != 'GET' else self.cache_base_url
        connection = httplib.HTTPSConnection(base_url)

        #hack needed when a PUT request has an empty body
        headers = {}
        if (body is None):
            headers['Content-length'] = 0

        #Make the request
        connection.request(http_method, url, json_body, headers)

        #get the response
        response = connection.getresponse()
        data = response.read()
        self._response_headers = response.getheaders()
        connection.close()

        logging.debug('[%s] %s %s %d %s\n' % (http_method, url, json_body, response.status, data))
        logging.info('[%s] %s %d' % (http_method, path, response.status))

        if (response.status >= httplib.BAD_REQUEST):
            return None
        else:
            if (len(data)==0):
                data = "true"
            return json.loads(data)

    def get(self, path, query={}):
        """Send a GET request.

        Type signature:
            (str, srt:{}) -> json str | None
        Parameters:
            path   - the url's path
            query - the query parameters
        Example:
            api = Ooyala(...)
            response = api.get('players/2kj390')
        """
        return self.send_request('GET', path, None, query)

    def put(self, path, body):
        """Send a PUT request.

        Type signature:
            (str, object) -> json str | None
        Parameters:
            path - the url's path
            body - the request's body
        Example:
            api = Ooyala(...)
            response = api.put('players/2kj390/metadata', {'skin' : 'branded'})
        """
        return self.send_request('PUT', path, body)

    def post(self, path, body):
        """Send a POST request.

        Type signature:
            (str, object) -> json str | None
        Parameters:
            path - the url's path
            body - the request's body
        Example:
            api = Ooyala(...)
            response = api.post('players/', {'name' : 'sample player'})
        """
        return self.send_request('POST', path, body)

    def patch(self, path, body):
        """Send a PATCH request.

        Type signature:
            (str, object) -> json str | None
        Parameters:
            path - the url's path
            body - the request's body
        Example:
            api = Ooyala(...)
            response = api.patch('players/2kj390', {'name' : 'renamed player'})
        """
        return self.send_request('PATCH', path, body)

    def delete(self, path):
        """Send a DELETE request.

        Type signature:
            (str) -> json str | None
        Key Parameters:
            'path' - the url's path
        Example:
            api = Ooyala(...)
            response = api.delete('players/2kj390')
        """
        return self.send_request('DELETE', path)

    def generate_signature(self, http_method, path, params, body=''):
        """Generates the signature for a request.

        Type signature:
            (str, str, dict, str:'') -> str
        Parameters:
            http_method - the http method
            path        - the url's path
            body        - the request's body (a JSON encoded string)
            params      - query parameters
        """
        signature = str(self.secret_key) + http_method.upper() + path
        for key, value in sorted(params.iteritems()):
            signature += key + '=' + str(value)
        # This is neccesary on python 2.7. if missing, signature+=body with raise an exception when body are bytes (image data)
        signature = signature.encode('ascii')
        signature += body
        signature = base64.b64encode(hashlib.sha256(signature).digest())[0:43]
        signature = urllib.quote_plus(signature)
        return signature

    def build_path(self, path, params):
        """Build the path for a request.
        
        Type signature:
            (str, dict) -> str
        Parameters:
            path        - the url's path
            params      - the query parameters
        """
        # a local function which check if item is a query param
        f = lambda k: k == 'where' or k == 'orderby' or k == 'limit' or k == 'page_token'
        url = path + '?'
        url += "&".join(["%s=%s" % (key, urllib.quote_plus(str(value)) if f(key) else value) for key, value in params.items()])
        return url

    def build_path_with_authentication_params(self, http_method, path, params, body):
        """Build the path for a Ooyala API request, including authentication parameters.
        
        Type signature:
            (str, str, str, dict, str) -> str
        Parameters:
            http_method - the http method
            path        - the url's path
            params      - the query parameters
            body        - the request's body
        """
        if (http_method not in HTTP_METHODS) or (self.api_key is None) or (self.secret_key is None):
            return None
        authentication_params = dict(params)
        #add the ooyala authentication params
        authentication_params['api_key'] = str(self.api_key)
        authentication_params['expires'] = str(self.expires)
        authentication_params['signature'] = self.generate_signature(http_method, path, authentication_params, body)
        return self.build_path(path, authentication_params)



    @property
    def response_headers(self):
        """Get the response's header from last request made.

        Type signature:
            () -> [(header,value)]
        """
        return self._response_headers

    def get_secret_key(self):
        """Secret Key getter.

        Type signature:
            () -> str
        Example:
            api = OoyalaAPI(...)
            print 'the secret key is ', api.secret_key
        """
        return self._secret_key

    def set_secret_key(self, value):
        """Secret Key setter.

        Type signature:
            (str) -> None
        Parameters:
            value - the secret key to be set
        Example:
            api = OoyalaAPI(...)
            api.secret_key = "83jja"
            print 'the new secret key is ', api.secret_key
        """
        self._secret_key = value

    secret_key = property(get_secret_key, set_secret_key)

    def get_api_key(self):
        """API Key getter.

        Type signature:
            () -> str
        Example:
            api = OoyalaAPI(...)
            print 'the API key is ', api.api_key
        """
        return self._api_key

    def set_api_key(self, value):
        """API Key setter.

        Type signature:
            (str) -> None
        Parameters:
            value - the API key to be set
        Example:
            api = OoyalaAPI(...)
            api.api_key = "332kka"
            print 'the new API key is ', api.api_key
        """
        self._api_key = value

    api_key = property(get_api_key, set_api_key)

    def get_base_url(self):
        """Base url getter.

        Type signature:
            () -> str
        Example:
            api = OoyalaAPI(...)
            print 'the base url is ', api.base_url
        """
        return self._base_url

    def set_base_url(self, value):
        """Base url setter.

        Type signature:
            (str) -> None
        Parameters:
            value - the url's base to be set
        Example:
            api = OoyalaAPI(...)
            api.base_url = "cache.api.ooyala.com"
            print 'the new url's base is ', api.base_url
        """
        self._base_url = value

    base_url = property(get_base_url, set_base_url)
    
    def get_cache_base_url(self):
        """Cache base url getter.
            
            Type signature:
            () -> str
            Example:
            api = OoyalaAPI(...)
            print 'the cache base url is ', api.cache_base_url
            """
        return self._cache_base_url
    
    def set_cache_base_url(self, value):
        """Cache base url setter.
            
            Type signature:
            (str) -> None
            Parameters:
            value - the url's base to be set
            Example:
            api = OoyalaAPI(...)
            api.base_url = "cache.api.ooyala.com"
            print 'the new url's base is ', api.cache_base_url
            """
        self._cache_base_url = value
    
    cache_base_url = property(get_cache_base_url, set_cache_base_url)

    def get_expiration_window(self): return self._expiration_window
    def set_expiration_window(self, value): self._expiration_window = value
    def del_expiration_window(self): del self._expiration_window
    expiration_window = property(get_expiration_window, set_expiration_window, del_expiration_window)

    @property
    def expires(self):
        """Computes the expiration's time

        Type signature:
            () -> int
        """
        now_plus_window = int(time.time()) + self.expiration_window
        return now_plus_window + DEFAULT_ROUND_UP_TIME - (now_plus_window % DEFAULT_ROUND_UP_TIME)
