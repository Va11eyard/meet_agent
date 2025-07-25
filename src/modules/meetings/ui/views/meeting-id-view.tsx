"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { useTRPC } from "@/trpc/client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { UpcomingState } from "../components/upcoming-state";
import { CancelledState } from "../components/cancelled-state";
import { ProcessingState } from "../components/processing-state";
import { ActiveState } from "../components/active-state";
import { CompletedState } from "../components/completed-state";

import { useConfirm } from "@/hooks/use-confirm";

import { useRouter } from "next/navigation";

import { useState } from "react";

interface Props {
    meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId }),
    );

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        "The following action will remove this meeting"
    )

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
                router.push("/meetings")
                // Invalidate free tier
            },
        })
    );

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        await removeMeeting.mutateAsync({ id: meetingId });
    }

    const isActive = data.status === "active";
    const isUpcoming = data.status === "upcoming";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isProcessing = data.status === "processing";


    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                {isActive && <ActiveState
                    meetingId={meetingId}
                />}
                {isUpcoming &&
                    <UpcomingState
                        meetingId={meetingId}
                        onCancelMeeting={() => { }}
                        isCancelling={false}
                    />}
                {isCancelled && <CancelledState />}
                {isCompleted && <CompletedState data={data} />}
                {isProcessing && <ProcessingState />}
            </div >
        </>
    )
}



export const MeetingIdViewLoading = () => {
    return (
        <LoadingState
            title="Loading Meetings"
            description="This may take a few seconds"
        />
    )
}

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error loading Meetings"
            description="Something went wrong"
        />
    )
}


