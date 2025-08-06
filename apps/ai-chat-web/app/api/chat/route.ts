import { NextResponse } from "next/server";
import { createChat } from "@/services/chat.service";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
	const { name } = await request.json();

	const chat = await createChat({
		name,
	});

	revalidatePath("/home");
	return NextResponse.json(chat);
}
