import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';


import { decodeAndVerifyJwtToken } from '../../service/account_service';

export async function createContext({
  req,
}: FetchCreateContextFnOptions | CreateNextContextOptions) {
  // Create your context based on the request object
  // Will be available as `ctx` in all your resolvers

  // This is just an example of something you might want to do in your ctx fn
  async function getUserFromHeader() {
    const authorization = req.headers['authentication']?.split(' ')[1];
    if (authorization) {
      const user = await decodeAndVerifyJwtToken(
        authorization
      );
      return user;
    }
    return null;
  }
  const user = await getUserFromHeader();

  return {
    user,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;