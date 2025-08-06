type NewsArticle = {
	title: string;
	description: string;
};

interface NewsApiClientInterface {
	getNews(query: string): Promise<NewsArticle[]>;
}

export class NewsApiClient implements NewsApiClientInterface {
	private readonly apiKey: string = process.env.NEXT_PUBLIC_NEWS_API_KEY ?? "";

	async getNews(query: string): Promise<NewsArticle[]> {
		try {
			const pageSize = 2;
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_NEWS_API_URL}/everything?q=${query}&pageSize=${pageSize}&apiKey=${this.apiKey}`,
			);

			const data = await response.json();
			if (!data.articles) {
				throw new Error("No articles found");
			}

			console.log("news api client data:", data);

			return data.articles.map(
				(article: { title: string; description: string }) =>
					({
						title: article.title,
						description: article.description,
					}) as NewsArticle,
			);
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}
