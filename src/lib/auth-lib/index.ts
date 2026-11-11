import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
    let session;
    try {
        session = await getServerSession(authOptions);
    } catch {
        return null;
    }
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    return user
        ? {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
          }
        : null;
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
}
