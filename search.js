const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client( {  
  hosts: [
    'http://localhost:9200/'
  ]
});


async function search(query) {
  const out = await client.search({  
    index: 'books',
    body:{
      query: {
      match: {"title":query}
    },
    sort: [{
      "download_count" : {"order" : "desc"}
   }]
  }
    
  });
  console.log(out.hits.hits)
  // appeler elasticsearch pour effectuer la recherche
  return out.hits.hits
}

module.exports = search
