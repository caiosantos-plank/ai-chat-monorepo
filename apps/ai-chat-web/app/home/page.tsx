import Link from "next/link";
import { getChats } from "@/services/chat.service";
import Card from "@/shared/components/ui/card/card";
import CardContent from "@/shared/components/ui/card/card-content";
import CardHeader from "@/shared/components/ui/card/card-header";
import CardTitle from "@/shared/components/ui/card/card-title";
import { MyChatsHeader } from "./_components";

export default async function HomePage() {
	const { data: chats } = await getChats();

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<MyChatsHeader />

			{chats && chats.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{chats.map((chat) => (
						<Link href={`/home/${chat.id}`} key={chat.id} className="block">
							<Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer group">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
										{chat.name}
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>
											Created {new Date(chat.created_at).toLocaleDateString()}
										</span>
										<svg
											className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<div className="max-w-md mx-auto">
						<div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
							<svg
								className="w-8 h-8 text-muted-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-2">
							No chats yet
						</h3>
						<p className="text-muted-foreground mb-6">
							Start your first conversation by creating a new chat
						</p>

					</div>
				</div>
			)}
		</div>
	);
}