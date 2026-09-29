import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getContent, updateContent } from "@/lib/content/store";
import { z } from "zod";

const schema = z.object({
  heroSubtitle: z.string().max(280).optional(),
  homeIntroTitle: z.string().max(120).optional(),
  homeIntroBody: z.string().max(4000).optional(),
  aboutTitle: z.string().max(120).optional(),
  aboutBody: z.string().max(8000).optional(),
  aboutStoryTitle: z.string().max(120).optional(),
  aboutStoryBody: z.string().max(8000).optional(),
  musicIntro: z.string().max(2000).optional(),
  spotifyEmbedUrl: z.string().url().nullable().optional().or(z.literal("")),
  spotifyArtistUrl: z.string().url().nullable().optional().or(z.literal("")),
  contactEmail: z.string().email().nullable().optional().or(z.literal("")),
  contactPhone: z.string().max(40).nullable().optional().or(z.literal("")),
  seoDescription: z.string().max(300).optional(),
  social: z
    .object({
      instagram: z.string().url().nullable().optional().or(z.literal("")),
      facebook: z.string().url().nullable().optional().or(z.literal("")),
      spotify: z.string().url().nullable().optional().or(z.literal("")),
      youtube: z.string().url().nullable().optional().or(z.literal("")),
      tiktok: z.string().url().nullable().optional().or(z.literal("")),
      appleMusic: z.string().url().nullable().optional().or(z.literal("")),
    })
    .optional(),
});

function emptyToNull(v: string | null | undefined) {
  if (v === "" || v === undefined) return null;
  return v;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ content: await getContent() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const parsed = schema.parse(await request.json());
    const patch = {
      ...parsed,
      spotifyEmbedUrl: emptyToNull(parsed.spotifyEmbedUrl as string | null),
      spotifyArtistUrl: emptyToNull(parsed.spotifyArtistUrl as string | null),
      contactEmail: emptyToNull(parsed.contactEmail as string | null),
      contactPhone: emptyToNull(parsed.contactPhone as string | null),
      social: parsed.social
        ? {
            instagram: emptyToNull(parsed.social.instagram),
            facebook: emptyToNull(parsed.social.facebook),
            spotify: emptyToNull(parsed.social.spotify),
            youtube: emptyToNull(parsed.social.youtube),
            tiktok: emptyToNull(parsed.social.tiktok),
            appleMusic: emptyToNull(parsed.social.appleMusic),
          }
        : undefined,
    };
    const content = await updateContent(patch);
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Datos inválidos" },
      { status: 400 }
    );
  }
}
