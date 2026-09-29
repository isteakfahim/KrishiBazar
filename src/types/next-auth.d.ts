import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    farmerProfileId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      farmerProfileId?: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    farmerProfileId?: string | null;
  }
}
