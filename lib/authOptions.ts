
// authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";

const parseAccessTokenExpiry = (accessToken?: string): number | undefined => {
  if (!accessToken) return undefined;

  const parts = accessToken.split(".");
  if (parts.length !== 3) return undefined;

  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8")
    ) as { exp?: number };

    if (typeof decoded.exp !== "number") return undefined;
    return decoded.exp * 1000;
  } catch {
    return undefined;
  }
};

const isAccessTokenExpired = (expiresAt?: number): boolean =>
  typeof expiresAt === "number" && Date.now() >= expiresAt;

export interface LoginResponse {
  statusCode?: number;
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: {
      user?: {
        _id: string;
        fullName?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
      email: string;
      role: string;
      profileImage?: string;
      refreshToken?: string;
      updatedAt?: string;
      accessRoutes?: string[];
    };
    accessToken?: string;
    refreshToken?: string;
  };
  responseTime?: string;
}

const splitName = (name?: string): { firstName?: string; lastName?: string } => {
  if (!name) return {};

  const normalizedName = name.trim().replace(/\s+/g, " ");
  if (!normalizedName) return {};

  const [firstName, ...rest] = normalizedName.split(" ");
  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : undefined,
  };
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

          if (!baseUrl) {
            throw new Error("Authentication service URL is not configured");
          }

          const email =
            typeof credentials?.email === "string"
              ? credentials.email.trim().toLowerCase()
              : "";
          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";

          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          const data: LoginResponse | null = await res.json().catch(() => null);
          const hasExplicitFailure = data?.status === false || data?.success === false;
          const accessToken = data?.data?.accessToken;
          const refreshToken = data?.data?.refreshToken;
          const user = data?.data?.user;

          if (!res.ok || hasExplicitFailure || !accessToken || !user) {
            throw new Error(data?.message ?? "Invalid email or password");
          }

          const normalizedRole =
            typeof user.role === "string" ? user.role.toLowerCase() : "";

          const derivedNameParts = splitName(user.fullName ?? user.name);
          const firstName = user.firstName ?? derivedNameParts.firstName;
          const lastName = user.lastName ?? derivedNameParts.lastName;
          const fullName =
            user.fullName?.trim() ||
            user.name?.trim() ||
            [firstName, lastName].filter(Boolean).join(" ") ||
            user.email;

          return {
            id: user._id,
            userId: user._id,
            email: user.email,
            role: normalizedRole,
            firstName,
            lastName,
            name: fullName,
            image: user.profileImage,
            profileImage: user.profileImage,
            updatedAt: user.updatedAt,
            accessRoutes: user.accessRoutes ?? [],
            accessToken,
            refreshToken: refreshToken ?? user.refreshToken,
            message: data?.message,
            success: data?.success,
            statusCode: data?.statusCode,
            responseTime: data?.responseTime,
          };
        } catch (error) {
          if (error instanceof Error) {
            console.error("[auth][authorize] login failed:", error.message);
            throw error;
          }
          console.error("[auth][authorize] login failed with unknown error");
          throw new Error("Login failed. Please try again.");
        }
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userId = user.userId ?? (user as { id?: string }).id;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = user.name;
        token.image = user.image;
        token.profileImage = user.profileImage ?? user.image;
        token.updatedAt = user.updatedAt;
        token.accessRoutes = user.accessRoutes ?? [];
        token.message = user.message;
        token.success = user.success;
        token.statusCode = user.statusCode;
        token.responseTime = user.responseTime;
        token.accessTokenExpires = parseAccessTokenExpiry(user.accessToken);
        token.error = undefined;
      }

      if (isAccessTokenExpired(token.accessTokenExpires)) {
        token.error = "AccessTokenExpired";
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        userId: token.userId as string,
        email: token.email as string,
        role: token.role as string,
        firstName: token.firstName as string | undefined,
        lastName: token.lastName as string | undefined,
        name: token.name as string | undefined,
        image: token.image as string | undefined,
        profileImage: token.profileImage as string | undefined,
        accessRoutes: token.accessRoutes ?? [],
        updatedAt: token.updatedAt as string | undefined,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : undefined;
      session.message = token.message;
      session.success = token.success;
      session.statusCode = token.statusCode;
      session.responseTime = token.responseTime;
      session.error = token.error;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
