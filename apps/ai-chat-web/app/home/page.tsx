import { getChats } from "@/services/chat.service";
import { ChatCard, MyChatsHeader } from "./_components";

export default async function HomePage() {
	const { data: chats } = await getChats();

	return (
		<div className="container mx-auto px-4 py-10 max-w-7xl">
			<div className="relative mb-8">
				<div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-secondary/10 via-transparent to-secondary/10 blur-2xl" />
				<MyChatsHeader />
			</div>

			{chats && chats.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{chats.map((chat, idx) => (
						<ChatCard key={chat.id} chat={chat} index={idx} />
					))}
				</div>
			) : (
				<div className="text-center py-16">
					<div className="max-w-md mx-auto">
						<div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center">
							<svg
								className="w-10 h-10 text-secondary"
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
						<h3 className="text-xl font-semibold text-foreground mb-2">
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