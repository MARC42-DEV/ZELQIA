// Native Zero-Dependency Shopify Storefront GraphQL Bridge
const SHOPIFY_DOMAIN = '4qb0jc-fs.myshopify.com';
const STOREFRONT_TOKEN = 'f9cebea085d89af7a1a6a7f712250d0b';

export const shopifyClient = {
  async fetchGraphQL(query) {
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });
    return await res.json();
  },

  async getProducts() {
    const query = `{
      products(first: 20) {
        edges {
          node {
            id
            title
            description
            productType
            variants(first: 5) {
              edges {
                node {
                  id
                  title
                  sku
                  price {
                    amount
                  }
                  compareAtPrice {
                    amount
                  }
                  availableForSale
                }
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                }
              }
            }
          }
        }
      }
    }`;

    try {
      const json = await this.fetchGraphQL(query);
      return json.data?.products?.edges?.map(({ node }) => ({
        _id: node.id,
        title: node.title,
        description: node.description,
        category: node.productType || 'Rings',
        purity: 'Fine 18K Gold Plated, 925 Silver & Stainless steels',
        isAntiTarnish: true,
        isHallmarked: true,
        variants: node.variants.edges.map(({ node: v }) => ({
          id: v.id,
          sku: v.sku || v.id,
          metalTone: v.title === 'Default Title' ? 'Yellow Gold' : v.title,
          price: parseFloat(v.price.amount),
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : null,
          images: node.images.edges.map(({ node: img }) => img.url),
          stock: v.availableForSale ? 10 : 0
        }))
      })) || [];
    } catch (err) {
      console.error('Shopify GraphQL Error:', err);
      return [];
    }
  }
};