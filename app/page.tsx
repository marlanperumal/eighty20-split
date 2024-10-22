import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";
import Game from "@/app/game";

export default async function Page() {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
        80/20: The Game
      </h1>
      <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
        Instructions
      </h2>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-1">
        <li>Draw a line on the canvas to split the dots</li>
        <li>
          The game will show the percentage of dots above and below the line
        </li>
        <li>Get close to a perfect 80/20 split for a high score</li>
        <li>Practice your skills for now. The real game starts soon...</li>
      </ul>
      <Game />
      <form>
        {data?.user ? (
          <Button formAction={logout} className="mt-4 w-[500px]">
            Log out
          </Button>
        ) : (
          <Button asChild className="mt-4 w-[500px]">
            <Link href="/login">Log in or Sign up to start competing</Link>
          </Button>
        )}
      </form>
    </div>
  );
}
