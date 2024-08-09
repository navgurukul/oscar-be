import { Injectable, UnauthorizedException } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { UsersService } from "../users/users.service"; // Adjust the path as necessary
import { JwtService } from "@nestjs/jwt";
import { $Enums } from "@prisma/client";

@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.client = new OAuth2Client();
  }

  async validateGoogleToken(idToken: string, isMobile: boolean) {
    try {
      // let flg = false;
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: isMobile
          ? process.env.ANDROID_GOOGLE_CLIENT_ID
          : process.env.WEB_GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException("Invalid token");
      }

      const { email, given_name, family_name, picture } = payload;

      // Check if the user exists in the database
      let user: any = await this.usersService.findByEmail(email);
      if (!user) {
        const createUser = await this.usersService.create({
          email,
          firstName: given_name,
          lastName: family_name,
          profilePicUrl: picture,
        });
        user = createUser;
      }

      const create_jwt_token = this.jwtService.sign({
        email: user.email,
        userId: user.id,
      });

      return {
        user,
        token: create_jwt_token,
      };
    } catch (error) {
      console.error("Error verifying Google ID token:", error);
      throw new UnauthorizedException("Invalid token signature");
    }
  }

  async validateUser(email: string): Promise<any> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (user) {
      return user;
    }
    return null;
  }

  async login(userData: any) {
    try {
      if (!userData.email) {
        throw new UnauthorizedException("Invalid User Data");
      }
      let user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string | null;
        profilePicUrl: string | null;
        subscriptionStatus: $Enums.SubscriptionStatus | null;
        createdAt: Date;
        updatedAt: Date;
      } | { message: string };
      user = await this.usersService.findByEmail(userData.email);
      if (!user && userData.firstName) {
        user = await this.usersService.create({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicUrl: userData.picture,
        });
      }
      const payload = { email: (user as { id: number; email: string; firstName: string; lastName: string; profilePicUrl: string; subscriptionStatus: $Enums.SubscriptionStatus | null; createdAt: Date; updatedAt: Date; }).email, userID: user.id };
      return {
        user,
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  validateToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });
  }
}
