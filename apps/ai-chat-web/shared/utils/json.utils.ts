export const jsonTryParse = (json: string) => {
	try {
		return JSON.parse(json);
	} catch (error) {
		return null;
	}
};
