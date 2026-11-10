import { Express, Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

type User = {
  username : string
}

declare global {
  namespace Express {
      export interface Request {
          user? : User
      }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COOKIE_KEY : string
    }
  }
}

var _loginUrl : string;
function initCookieAuth(app : Express, loginUrl : string) {
  _loginUrl = loginUrl;
  app.use(cookieParser(process.env.COOKIE_KEY || 'development-only-cookie-secret'));
  app.use(setUserInfo);
}

function signInUser(res : Response, username : string) {
  res.cookie('user', username, {
      signed : true,
      httpOnly: true
  });
}

function signOutUser(res : Response) {
  res.clearCookie('user');
}

function setUserInfo(req : Request, res : Response, next : NextFunction) {    
  const username = req.signedCookies?.user;  
  if (username) { 
    req.user = {      
      username
    };
  }  
  next(); 
}

function requiresAuthentication(req : Request, res : Response, next : NextFunction) {  
  if (req.user) next();
  else alert("You must be logged in to perform this action.");            
}
  
export {initCookieAuth, signInUser, signOutUser, requiresAuthentication};