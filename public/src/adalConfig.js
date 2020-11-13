import { AuthenticationContext, adalFetch, withAdalLogin, adalGetToken } from 'react-adal';

export const adalConfig = {
    tenant: 'cloudtotvs.onmicrosoft.com',
    clientId: '452535ab-99e1-4ef1-abf2-9b1a3aa59d57',
    // clientId: null,
    // redirectUri: 'http://localhost:3000/login/callback',
    // redirectUri: 'http://localhost:3000/login',
    redirectUri: `${process.env.REACT_APP_CDN_URL}/login/callback`,
    endpoints: {
        api: '683c6944-b2be-4f78-907a-437ac2916276',
    },
    cacheLocation: 'localStorage',
};

export const authContext = new AuthenticationContext(adalConfig);

export const adalApiFetch = (fetch, url, options) =>
    adalFetch(authContext, adalConfig.endpoints.api, fetch, url, options);

export const withAdalLoginApi = withAdalLogin(authContext, adalConfig.endpoints.api);

export const refreshToken = () => {
    return new Promise((resolve, reject) => {

        try{
            adalGetToken(authContext, adalConfig.clientId);
            // console.log("renewd");
            resolve(getToken());
        }catch{
            reject(Error('promise failed'))
        }
    })
}

// export const authContext = new AuthenticationContext(adalConfig);

export const getToken = () => authContext.getCachedToken(adalConfig.clientId);