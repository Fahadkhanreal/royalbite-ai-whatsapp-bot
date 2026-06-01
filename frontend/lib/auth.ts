import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "@/lib/validations/admin"
import { isAdminUser, verifyAdminCredentials } from "@/lib/repositories/admin-users"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        return verifyAdminCredentials(parsed.data.email, parsed.data.password)
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

      if (!isAdminRoute) {
        return true
      }

      return isAdminUser(session?.user)
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "admin"
      }

      return session
    },
  },
})
