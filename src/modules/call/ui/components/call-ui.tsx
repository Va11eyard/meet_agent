interface Props {
    meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black">
            <h1 className="text-2xl font-bold text-white mb-4">Meeting: {meetingName}</h1>
            <p className="text-lg text-gray-300">Connecting to the call...</p>
        </div>
    );
};
