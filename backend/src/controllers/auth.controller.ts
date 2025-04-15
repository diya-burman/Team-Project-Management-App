import { config } from "../config/app.config";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../validation/auth.validation";
import { registerUserService } from "../services/auth.service";
import passport from "passport";


export const googleLoginCallback = asyncHandler(
    async (req: Request, res: Response) => {
      const currentWorkspace = req.user?.currentWorkspace;
  
      if (!currentWorkspace) {
        return res.redirect(
          `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
        );
      }
  
      return res.redirect(
        `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
      );
    }
);

export const registerUserController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = registerSchema.parse({
            ...req.body,
          });
      
          await registerUserService(body);
      
          return res.status(HTTPSTATUS.CREATED).json({
            message: "User created successfully",
          });
    }
);

export const loginController = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate(
        "local",
        (
          err: Error | null,
          user: Express.User | false,
          info: { message: string } | undefined
        ) => {
          if (err) {
            return next(err);
          }
  
          if (!user) {
            return res.status(HTTPSTATUS.UNAUTHORIZED).json({
              message: info?.message || "Invalid email or password",
            });
          }
  
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
  
            return res.status(HTTPSTATUS.OK).json({
              message: "Logged in successfully",
              user,
            });
          });
        }
      )(req, res, next);
    }
);
  
  