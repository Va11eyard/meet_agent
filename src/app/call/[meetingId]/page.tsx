import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
    params: Promise<{
        meetingId: string;
    }>;
};

export const Page = async ({ params }: Props) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in")
    }

    const { meetingId } = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId }
        )
    )


    return (
        
    );
}