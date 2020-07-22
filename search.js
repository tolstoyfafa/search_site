const elasticsearch = require('elasticsearch')

const client = new elasticsearch.Client({
  host: 'localhost:9200',
})

async function search(query, sorting_type) {

  const custom_sort = []
  switch (sorting_type) {
    default:
    case "pertinence":
      custom_sort.push({
        _score: {
          order: "desc",
        }
      })
      break
    case "downloads":
      custom_sort.push({
        download_count: {
          order: "desc",
        }
      })
      break
    case "oldest":
      custom_sort.push({
        "authors.birth_year": {
          order: "asc",
        }
      })
      break
    case "youngest":
      custom_sort.push({
        "authors.birth_year": {
          order: "desc",
        }
      })
      break
  }


  const search_query = {
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
      },
      sort: custom_sort,
    }
  }
  console.log(JSON.stringify(search_query, null, 4))

  const results = await client.search(search_query)
  return results.hits
}

module.exports = search
