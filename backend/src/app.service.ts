
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { URL } from 'url';

@Injectable()
export class AppService {
  async getInstallURL(): Promise<{
    url: URL;
    state: string;
    verifier: string;
  }> {

////////////////////////////////////////////
    const base64URL = (s: string | Buffer): string => 
    s
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
/////////////////////////////////////////////
const rand = (fmt: BufferEncoding, depth = 32): string =>
  crypto.randomBytes(depth).toString(fmt);


    const state: string = rand('base64');
    const verifier: string = rand('ascii');

    const digest: string = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64')
      .toString();

    const challenge: string = base64URL(digest);

    const url: URL = new URL(
      '/oauth/authorize',
      process.env.ZM_HOST || 'https://zoom.us',
    );

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.ZM_CLIENT_ID);
    url.searchParams.set('redirect_uri', process.env.ZM_REDIRECT_URL);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);

    return { url, state, verifier };
  }
}
