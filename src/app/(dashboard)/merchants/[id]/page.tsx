import { api } from "@/lib/api";
import { formatPHP, formatNumber } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { MerchantStatusMenu } from "@/components/merchant-status-menu";
import { PlanManagement } from "@/components/plan-management";
import { QrTile } from "@/components/qr-tile";
import { PayoutAccountEdit } from "@/components/payout-account-edit";
import { PaymongoCredentialsEdit } from "@/components/paymongo-credentials-edit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";

interface Plan {
	id: string;
	name: string;
	price_centavos: number;
	billing_cycle: string;
	status: string;
	allowance_type: string;
	allowance_amount: string | null;
	description: string | null;
	tags: string[] | null;
	paymongo_plan_id: string | null;
}

interface PayoutAccount {
	method_type: string;
	account_name: string;
	account_number: string;
	bank_code: string | null;
	is_verified: boolean;
}

interface MerchantDetail {
	merchant: {
		id: string;
		name: string;
		status: "active" | "pending" | "suspended";
		created_at: string;
		paymongo_keys_configured: boolean;
	};
	plans: Plan[];
	balance: number;
	active_payout_account: PayoutAccount | null;
	subscription_counts: Record<string, number>;
}

export default async function MerchantDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const UUID_RE =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!UUID_RE.test(id)) notFound();

	const detail = await api.get<MerchantDetail>(`/admin/merchants/${id}/detail`);
	const {
		merchant,
		plans,
		balance,
		active_payout_account,
		subscription_counts,
	} = detail;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<Link href="/merchants" className="text-zinc-400 hover:text-zinc-600">
					<ArrowLeft size={18} />
				</Link>
				<h1 className="text-xl font-semibold">{merchant.name}</h1>
				<StatusBadge status={merchant.status} type="merchant" />
				<div className="ml-auto">
					<MerchantStatusMenu
						merchantId={merchant.id}
						currentStatus={merchant.status}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm text-zinc-500">Balance</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold">{formatPHP(balance)}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm text-zinc-500">
							Active Subscriptions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-semibold">
							{formatNumber(subscription_counts.active ?? 0)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-1">
						<CardTitle className="text-sm text-zinc-500">
							Payout Method
						</CardTitle>
						<PayoutAccountEdit
							merchantId={merchant.id}
							currentAccount={active_payout_account}
						/>
					</CardHeader>
					<CardContent>
						{active_payout_account ? (
							<div>
								<p className="font-medium capitalize">
									{active_payout_account.method_type}
								</p>
								<p className="text-sm text-zinc-500">
									{active_payout_account.account_name}
								</p>
								<p className="text-xs text-zinc-400">
									{active_payout_account.account_number}
								</p>
							</div>
						) : (
							<p className="text-sm text-zinc-400">Not set</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-1">
						<CardTitle className="text-sm text-zinc-500">
							PayMongo Credentials
						</CardTitle>
						<PaymongoCredentialsEdit merchantId={merchant.id} />
					</CardHeader>
					<CardContent>
						{merchant.paymongo_keys_configured ? (
							<Badge className="border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
								Configured
							</Badge>
						) : (
							<Badge className="border-0 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
								Not Configured
							</Badge>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="flex justify-end">
				<Link
					href={`/merchants/${id}/earnings`}
					className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900"
				>
					<TrendingUp size={14} />
					View Earnings
				</Link>
			</div>

			<PlanManagement plans={plans} merchantId={merchant.id} />

			<div>
				<h2 className="text-base font-semibold mb-4">Store QR</h2>
				<QrTile
					title={merchant.name}
					subtitle="Shop QR"
					url={`https://subscriber.getmemberry.com/shop/${merchant.id}`}
					filename={`${merchant.name.toLowerCase().replace(/\s+/g, "-")}-store.png`}
					logoSrc="/assets/logo.png"
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Subscription Breakdown</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
					{Object.entries(subscription_counts).map(([status, count]) => (
						<div key={status} className="text-center">
							<p className="text-xl font-semibold">{count}</p>
							<p className="text-xs text-zinc-500 capitalize">
								{status.replace("_", " ")}
							</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
