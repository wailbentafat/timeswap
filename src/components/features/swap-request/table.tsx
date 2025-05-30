"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SwapRequestStatus } from "@/components/features/swap-request/status";
import { SwapRequestDetails } from "@/components/features/swap-request/details";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionSwap } from "@/types/session";
import { acceptSwapRequest } from "@/actions/acceptnotif";
import { rejectSwapRequest } from "@/actions/refusenotif";
import { toast } from "sonner";

type Props = {
    data: SessionSwap[];
    onRequestUpdate?: () => void;
};

export function SwapRequestTable({ data, onRequestUpdate }: Props) {
    const [selectedRequest, setSelectedRequest] = useState<SessionSwap | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const handleViewDetails = (request: SessionSwap) => {
        setSelectedRequest(request);
        setDetailsOpen(true);
    };

    const handleAccept = async (requestId: string) => {
        setLoading(requestId);
        try {
            await acceptSwapRequest(requestId);
            toast.success("Swap request accepted successfully");
            onRequestUpdate?.();
        } catch (error) {
            toast.error("Failed to accept swap request");
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setLoading(requestId);
        try {
            await rejectSwapRequest(requestId);
            toast.success("Swap request rejected successfully");
            onRequestUpdate?.();
        } catch (error) {
            toast.error("Failed to reject swap request");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-3 w-10">
                            <Checkbox />
                        </th>
                        <th className="p-3 text-left font-medium">Date</th>
                        <th className="p-3 text-left font-medium">Subject</th>
                        <th className="p-3 text-left font-medium">Professor</th>
                        <th className="p-3 text-left font-medium">Type</th>
                        <th className="p-3 text-left font-medium">Room</th>
                        <th className="p-3 text-left font-medium">New Room</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((request) => (
                        <tr key={request.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="p-3">
                                <Checkbox />
                            </td>
                            <td className="p-3 text-sm">
                                {request.from_session.week_day}, {request.from_session.starting_time} -{" "}
                                {request.from_session.ending_time}
                            </td>
                            <td className="p-3 text-sm">{request.from_session.module}</td>
                            <td className="p-3 text-sm">{request.from_session.teacher.username}</td>
                            <td className="p-3">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-md ${
                                        request.from_session.session_type === "Cour"
                                            ? "bg-blue-500 text-white"
                                            : request.from_session.session_type === "TD"
                                            ? "bg-green-500 text-white"
                                            : "bg-orange-500 text-white"
                                    }`}
                                >
                                    {request.from_session.session_type}
                                </span>
                            </td>
                            <td className="p-3 text-sm">{request.from_session.room.room_id}</td>
                            <td className="p-3 text-sm">{request.to_session.room.room_id}</td>
                            <td className="p-3">
                                <SwapRequestStatus status={request.status.toLowerCase() as any} />
                            </td>
                            <td className="p-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                                            View Details
                                        </DropdownMenuItem>
                                        {request.status === "PENDING" && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => handleAccept(request.id.toString())}
                                                    disabled={loading === request.id.toString()}
                                                >
                                                    {loading === request.id.toString()
                                                        ? "Accepting..."
                                                        : "Accept"}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleReject(request.id.toString())}
                                                    disabled={loading === request.id.toString()}
                                                >
                                                    {loading === request.id.toString()
                                                        ? "Rejecting..."
                                                        : "Reject"}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            <SwapRequestDetails
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                data={
                    selectedRequest
                        ? {
                              subject: selectedRequest.from_session.module,
                              type: selectedRequest.from_session.session_type,
                              date: `${selectedRequest.from_session.week_day}, ${selectedRequest.from_session.starting_time} - ${selectedRequest.from_session.ending_time}`,
                              requestedBy: selectedRequest.from_session.teacher.username,
                              requestedTo: selectedRequest.to_session.teacher.username,
                              room: selectedRequest.from_session.room.room_id,
                              newRoom: selectedRequest.to_session.room.room_id,
                              status: selectedRequest.status.toLowerCase() as any,
                          }
                        : undefined
                }
            />
        </div>
    );
}
