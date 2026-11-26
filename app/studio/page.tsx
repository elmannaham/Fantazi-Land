import type { Metadata } from "next";
import StudioWorkspace from "@/components/studio/StudioWorkspace";

export const metadata: Metadata = {
  title: "VideoFlow Studio — Studio de création vidéo assistée par IA",
  description:
    "Planifiez, générez, swappez et assemblez vos vidéos courtes au même endroit : storyboard, prompts, swap et montage.",
};

export const dynamic = "force-dynamic";

export default function StudioPage() {
  return <StudioWorkspace />;
}
