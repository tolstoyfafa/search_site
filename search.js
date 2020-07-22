const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: 'localhost:9200',
})

async function search(query, sort) {
	const results = await client.search({
		index: "books",
		body: {
			query: {
				multi_match: {
					query,
					fields: [
						"title^3",
						"authors.name^2",
						"subjects^1",
					],
          fuzziness: "AUTO",
				},
			},
      highlight: {
        pre_tags: `<span style="color: green;">`,
        post_tags: "</span>",
        fields: {
          title: {},
          "authors.name": {},
          subjects: {},
        }
      }
		}
	})
	return results.hits
}

module.exports = search
