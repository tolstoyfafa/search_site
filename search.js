const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: 'localhost:9200',
})

async function search(query) {
	const results = await client.search({
		index: "books",
		body: {
			query: {
				match_all: { }
			}
		}
	})
	return results.hits
}

module.exports = search
