import { BlipClient } from "../clients/BlipClient.js";

const client = new BlipClient({
	tenant: "wlck",
	apiKey: process.env.API_KEY ?? "",
	maxConcurrentRequests: 25,
});

const today = new Date();
const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);

const filters = {
	endDate: today.toISOString().split("T")[0]!,
	startDate: yesterday.toISOString().split("T")[0]!,
};

const categories = await client.trackings.getCategories();

const counters = await Promise.all(
	categories.map((c) => client.trackings.getCategoryCounters(c.category, { filters })),
);

const allTrackings = await Promise.all(
	counters.flat().map(({ category, action }) => client.trackings.getEventDetails(category, action, { filters })),
);

console.log(allTrackings);
