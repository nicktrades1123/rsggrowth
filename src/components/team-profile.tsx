import Image from "next/image";
import type { ReactNode } from "react";

export function TeamProfile({
  name,
  role,
  portrait,
  children,
}: {
  name: string;
  role: string;
  portrait?: { src: string; width: number; height: number };
  children: ReactNode;
}) {
  return (
    <article className="team-profile">
      <div>
        {portrait && (
          <Image
            {...portrait}
            alt={name}
            unoptimized
            className="team-portrait"
          />
        )}
        <h3>{name}</h3>
        <p>{role}</p>
      </div>
      <div className="prose">{children}</div>
    </article>
  );
}
