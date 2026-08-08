import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface MerchantStaff {
	id: string;
	user_id: string | null;
	name: string;
	gcash_phone: string;
	contact_phone: string | null;
	is_active: boolean;
	created_at: string;
}

interface MerchantStaffInvite {
	id: string;
	staff_id: string | null;
	invite_code: string;
	expires_at: string;
	used_at: string | null;
	created_at: string;
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("en-PH", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function inviteStatus(invite: MerchantStaffInvite): "used" | "expired" | "active" {
	if (invite.used_at) return "used";
	if (new Date(invite.expires_at).getTime() < Date.now()) return "expired";
	return "active";
}

const inviteStatusColors: Record<string, string> = {
	active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	used: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
	expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function StaffList({
	staff,
	invites,
}: {
	staff: MerchantStaff[];
	invites: MerchantStaffInvite[];
}) {
	const staffById = new Map(staff.map((s) => [s.id, s]));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Staff</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6 p-0">
				<div>
					<h3 className="px-6 pb-2 text-sm font-medium text-zinc-500">
						Roster
					</h3>
					{staff.length === 0 ? (
						<p className="text-center text-zinc-400 py-8 text-sm">
							No staff yet
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Account</TableHead>
									<TableHead>Joined</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{staff.map((member) => (
									<TableRow key={member.id}>
										<TableCell className="font-medium">
											{member.name}
										</TableCell>
										<TableCell className="text-sm text-zinc-500">
											{member.contact_phone ?? member.gcash_phone}
										</TableCell>
										<TableCell>
											<Badge
												className={cn(
													"capitalize border-0 text-xs",
													member.is_active
														? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
														: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
												)}
											>
												{member.is_active ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
										<TableCell className="text-sm text-zinc-500">
											{member.user_id ? "Linked" : "Awaiting registration"}
										</TableCell>
										<TableCell className="text-sm text-zinc-500">
											{formatDate(member.created_at)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>

				<div>
					<h3 className="px-6 pb-2 text-sm font-medium text-zinc-500">
						Invites
					</h3>
					{invites.length === 0 ? (
						<p className="text-center text-zinc-400 py-8 text-sm">
							No invites issued
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Code</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead>Staff</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invites.map((invite) => {
									const status = inviteStatus(invite);
									const linkedStaff = invite.staff_id
										? staffById.get(invite.staff_id)
										: undefined;
									return (
										<TableRow key={invite.id}>
											<TableCell className="font-mono text-sm">
												{invite.invite_code}
											</TableCell>
											<TableCell>
												<Badge
													className={cn(
														"capitalize border-0 text-xs",
														inviteStatusColors[status],
													)}
												>
													{status}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-zinc-500">
												{formatDate(invite.expires_at)}
											</TableCell>
											<TableCell className="text-sm text-zinc-500">
												{linkedStaff?.name ?? "—"}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
