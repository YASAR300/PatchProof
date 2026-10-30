import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/auth";
import { getProjectForUser, PROJECT_COOKIE_NAME } from "@/lib/projects";

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    // Verify user is a member
    const project = await getProjectForUser(projectId, user.id);
    if (!project) {
      return NextResponse.json(
        { error: "You do not have access to this project." },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(PROJECT_COOKIE_NAME, projectId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true, activeProjectId: projectId });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to switch project." },
      { status: 500 }
    );
  }
}

