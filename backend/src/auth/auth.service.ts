import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { URL } from 'url';
import { Session as ExpressSession } from 'express-session';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { host } from './utility/utility';
import { User } from 'src/user/entity/user.entity';

export interface InsertUserModel extends Omit<User, 'id'> {};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async saveUser(data: any, accessToken: string, refreshToken: string): Promise<User> {
    const user: InsertUserModel = {  
      zoomId: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }

    return await this.userRepository.save(user);
  }

  async tokenRequest(params: Record<string, string>, id = '', secret = ''): Promise<Record<string, string>> {
    try {
    const username = id || process.env.ZM_CLIENT_ID;
    const password = secret || process.env.ZM_CLIENT_SECRET;

    return axios({
      data: new URLSearchParams(params).toString(),
      baseURL: host.href,
      url: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username,
        password,
      },
    })
  } catch (err) {
    throw new BadRequestException('Something gone wrong')
  }
  }

  async apiRequest(method: string, endpoint: string, token: string, data: Record<string, string> = null): Promise<Record<string, string>> {
    return axios({data, method, baseURL: host.href, url: `/v2${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(({ data }) => {
        return Promise.resolve(data);
      })
      .catch((error) => {
        console.log(error);
        throw new BadRequestException(error);
      });
  }

  async getToken(code: string, verifier: string, code_challenge_method: string): Promise<Record<string, string>> {
    if (!code || typeof code !== 'string') {
      throw new InternalServerErrorException('Authorization code must be a valid string');
    }

    if (!verifier || typeof verifier !== 'string') {
      throw new InternalServerErrorException('Code verifier code must be a valid string');
    }
    console.log(this.tokenRequest)
    return this.tokenRequest({
      code,
      code_verifier: verifier,
      redirect_uri: process.env.ZM_REDIRECT_URL,
      grant_type: 'authorization_code',
      code_challenge_method,
    });
  }

  async refreshToken(token: string): Promise<Record<string, string>> {
    if (!token || typeof token !== 'string') {
      throw new InternalServerErrorException('Refresh token must be a valid string');
    }

    return this.tokenRequest({
      refresh_token: token,
      grant_type: 'refresh_token',
    });
  }

  async getZoomUser(token: string): Promise<Record<string, string>> {
    return this.apiRequest('GET', `/users/me`, token);
  }

  async getDeeplink(session: ExpressSession & { state: string; verifier: string }, code: string): Promise<string> {
    session.state = null;
    const verifier = session.verifier;
    session.verifier = null;

    const { access_token: accessToken, refresh_token: refreshToken } = await this.getToken(code, verifier, 'S256');
    const zoomUser = await this.getZoomUser(accessToken);

    await this.saveUser(zoomUser, accessToken, refreshToken);

    return this.apiRequest('POST', '/zoomapp/deeplink', accessToken, {
      action: JSON.stringify({
        url: '/',
        role_name: 'Owner',
        verified: 1,
        role_id: 0,
      }),
    }).then((data) => Promise.resolve(data.deeplink));
  }
}
