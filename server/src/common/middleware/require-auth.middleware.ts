import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";
import { UnauthorizedError } from "../utils/app-error.js";

declare global {
  namespace Express {
    interface Request {
      session?: {
        session: {
          id: string;
          userId: string;
          expiresAt: Date;
          token: string;
          createdAt: Date;
          updatedAt: Date;
          ipAddress?: string | null;
          userAgent?: string | null;
        };
        user: {
          id: string;
          name: string;
          email: string;
          emailVerified: boolean;
          image?: string | null;
          plan?: string | null;
          razorpaySubscriptionId?: string | null;
          subscriptionStatus?: string | null;
          subscriptionRenewsAt?: Date | null;
          createdAt: Date;
          updatedAt: Date;
        };
      };
    }
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      throw new UnauthorizedError("Authentication required");
    }

    req.session = session as unknown as Express.Request["session"];
    next();
  } catch (error) {
    next(error);
  }
};
