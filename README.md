# Quotable API

This is an implementation of the [Quotable](https://github.com/lukePeavey/quotable) but rewritten using [AdonisJS](https://adonisjs.com).

## API Reference <!-- omit in toc -->

- [Quotable API](#quotable-api)
  - [Get random quote](#get-random-quote)
    - [Query parameters](#query-parameters)
    - [Response](#response)
  - [Get Random Quotes](#get-random-quotes)
    - [Response](#response-1)
  - [List Quotes](#list-quotes)
    - [Query parameters](#query-parameters-1)
    - [Response](#response-2)
  - [Get Quote By ID](#get-quote-by-id)
    - [Response](#response-3)
  - [List Authors](#list-authors)
    - [Query parameters](#query-parameters-2)
    - [Response](#response-4)
  - [Get Author By ID](#get-author-by-id)
    - [Response](#response-5)
  - [Get Author By Slug](#get-author-by-slug)
    - [Response](#response-6)
  - [List Tags](#list-tags)
    - [Query parameters](#query-parameters-3)
    - [Response](#response-7)

## Get random quote

```HTTP
GET /random
```

Returns a single random quote from the database

### Query parameters

| param     | type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :-------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maxLength | `Int`    | The maximum Length in characters ( can be combined with `minLength` )                                                                                                                                                                                                                                                                                                                                                                                     |
| minLength | `Int`    | The minimum Length in characters ( can be combined with `maxLength` )                                                                                                                                                                                                                                                                                                                                                                                     |
| tags      | `String` | Get a random quote with specific tag(s). This takes a list of one or more tag names, separated by a comma (meaning `AND`) or a pipe (meaning `OR`). A comma separated list will match quotes that have **_all_** of the given tags. While a pipe (`\|`) separated list will match quotes that have **any one** of the provided tags. Tag names are **not** case-sensitive. Multi-word tags can be kebab-case ("tag-name") or space separated ("tag name") |
| author    | `String` | Get a random quote by one or more authors. The value can be an author `name` or `slug`. To include quotes by multiple authors, provide a pipe-separated list of author names/slugs.                                                                                                                                                                                                                                                                       |

### Response

```ts
{
  id: number
  // The quotation text
  content: string
  // The full name of the author
  author: string
  // The `slug` of the quote author
  authorSlug: string
  // The length of quote (number of characters)
  length: number
  // An array of tag names for this quote
  tags: string[]
  // The time the quote was added to the database.
  createdAt: DateTime
  // The time the quote was edited.
  updatedAt: DateTime
}
```

## Get Random Quotes

```HTTP
GET /quotes/random
```

Get one or more random quotes from the database. This method supports several filters that can be used to get random quotes with specific properties (ie. tags, quote length, etc.)

By default, this methods returns a single random quote. You can specify the number of random quotes to return via the `limit` parameter.

> ⚠️ This method is equivalent to the `/random` endpoint. The only difference is the response format:
> Instead of retuning a single `Quote` object, this method returns an `Array` of `Quote` objects.

| param     | type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :-------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| limit     | `Int`    | `default: 10` &nbsp; `min: 10` <br> The number of random quotes to retrieve.                                                                                                                                                                                                                                                                                                                                                                              |
| maxLength | `Int`    | The maximum Length in characters ( can be combined with `minLength` )                                                                                                                                                                                                                                                                                                                                                                                     |
| minLength | `Int`    | The minimum Length in characters ( can be combined with `maxLength` )                                                                                                                                                                                                                                                                                                                                                                                     |
| tags      | `String` | Get a random quote with specific tag(s). This takes a list of one or more tag names, separated by a comma (meaning `AND`) or a pipe (meaning `OR`). A comma separated list will match quotes that have **_all_** of the given tags. While a pipe (`\|`) separated list will match quotes that have **any one** of the provided tags. Tag names are **not** case-sensitive. Multi-word tags can be kebab-case ("tag-name") or space separated ("tag name") |
| author    | `String` | Get a random quote by one or more authors. The value can be an author `name` or `slug`. To include quotes by multiple authors, provide a pipe-separated list of author names/slugs.                                                                                                                                                                                                                                                                       |

### Response

```ts
// An array containing one or more Quotes
Array<{
  id: number
  // The quotation text
  content: string
  // The full name of the author
  author: string
  // The `slug` of the quote author
  authorSlug: string
  // The length of quote (number of characters)
  length: number
  // An array of tag names for this quote
  tags: string[]
  // The time the quote was added to the database.
  createdAt: DateTime
  // The time the quote was edited.
  updatedAt: DateTime
}>
```

## List Quotes

```HTTP
GET /quotes
```

Get all quotes matching a given query. By default, this will return a paginated list of all quotes, sorted by `id`. Quotes can also be filter by author, tag, and length.

### Query parameters

| param     | type     | Description                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :-------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| maxLength | `Int`    | The maximum Length in characters ( can be combined with `minLength` )                                                                                                                                                                                                                                                                                                                                                                 |
| minLength | `Int`    | The minimum Length in characters ( can be combined with `maxLength` )                                                                                                                                                                                                                                                                                                                                                                 |
| tags      | `String` | Filter quotes by tag(s). Takes a list of one or more tag names, separated by a comma (meaning `AND`) or a pipe (meaning `OR`). A comma separated list will match quotes that have **_all_** of the given tags. While a pipe (`\|`) separated list will match quotes that have **_either_** of the provided tags. Tag names are **not** case-sensitive. Multi-word tags can be kebab-case ("tag-name") or space separated ("tag name") |
| author    | `String` | Get quotes by a specific author. The value can be an author `name` or `slug`. To get quotes by multiple authors, provide a pipe separated list of author names/slugs.                                                                                                                                                                                                                                                                 |
| sortBy    | `enum`   | `Default: "createdAt"` &nbsp; `values: "createdAt", "updatedAt", "content"` <br> The field used to sort quotes                                                                                                                                                                                                                                                                                                                        |
| order     | `enum`   | `values: "asc", "desc"` &nbsp; `default: depends on sortBy` <br> The order in which results are sorted. The default order depends on the sortBy field. For string fields that are sorted alphabetically, the default order is ascending. For number and date fields, the default order is descending.                                                                                                                                 |
| limit     | `Int`    | `Min: 10` &nbsp; `Default: 10` <br> Sets the number of results per page.                                                                                                                                                                                                                                                                                                                                                              |
| page      | `Int`    | `Min: 1` &nbsp; `Default: 1` <br> The page of results to return. If the value is greater than the total number of pages, request will not return any results                                                                                                                                                                                                                                                                          |

### Response

```ts
{
  meta: {
    total: number,
    perPage: number,
    currentPage: number,
    lastPage: number,
    firstPage: number
    firstPageUrl: string,
    lastPageUrl: string,
    nextPageUrl: ?string,
    previousPageUrl: ?string
  },
  data: Array<{
    id: number
    // The quotation text
    content: string
    // The full name of the author
    author: string
    // The `slug` of the quote author
    authorSlug: string
    // The length of quote (number of characters)
    length: number
    // An array of tag names for this quote
    tags: string[]
    // The time the quote was added to the database.
    createdAt: DateTime
    // The time the quote was edited.
    updatedAt: DateTime
  }>
}
```

## Get Quote By ID

```HTTP
GET /quotes/:id
```

Get a quote by its ID

### Response

```ts
{
  id: number
  // The quotation text
  content: string
  // The full name of the author
  author: string
  // The length of quote (number of characters)
  length: number
  // An array of tag names for this quote
  tags: string[]
  // The time the quote was added to the database.
  createdAt: DateTime
  // The time the quote was edited.
  updatedAt: DateTime
}
```

## List Authors

```HTTP
GET /authors
```

Get all authors matching the given query. This endpoint can be used to list authors, with several options for sorting and filter. It can also be used to get author details for one or more specific authors, using the author slug or ids.

### Query parameters

| param  | type     | Description                                                                                                                                                                                                                                                                                    |
| :----- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| slug   | `string` | Filter authors by slug. The value can be one or more author slugs. To get multiple authors by slug, the value should be a pipe separated list of slugs.                                                                                                                                        |
| sortBy | `enum`   | `Default: "name"` &nbsp; `values: "createdAt", "updatedAt", "name"` <br> The field used to sort authors.                                                                                                                                                                                       |
| order  | `enum`   | `values: "asc", "desc"` <br> The order in which results are sorted. The default order depends on the sortBy field. For string fields that are sorted alphabetically (ie `name`), the default order is ascending. For number and date fields (ie `quoteCount`) the default order is descending. |
| limit  | `Int`    | `Min: 10` &nbsp; `Max: 150` &nbsp; `Default: 10` <br> Sets the number of results per page.                                                                                                                                                                                                     |
| page   | `Int`    | `Min: 1` &nbsp; `Default: 1` <br> The page of results to return. If the value is greater than the total number of pages, request will not return any results                                                                                                                                   |

### Response

```ts
{
  meta: {
    total: number,
    perPage: number,
    currentPage: number,
    lastPage: number,
    firstPage: number
    firstPageUrl: string,
    lastPageUrl: string,
    nextPageUrl: ?string,
    previousPageUrl: ?string
  },
  data: Array<{
    // A unique id for this author
    id: number
    // A brief, one paragraph bio of the author. Source: wiki API
    bio: string
    // A one-line description of the author. Typically it is the person's primary
    // occupation or what they are know for.
    description: string
    // The link to the author's wikipedia page or official website
    link: string
    // The authors full name
    name: string
    // A slug is a URL-friendly ID derived from the authors name. It can be used as
    // identifier for the author
    slug: string
    // The time the author was added to the database.
    createdAt: DateTime
    // The time the author was edited.
    updatedAt: DateTime
  }>
}
```

## Get Author By ID

Get a _single_ `Author` by `id`. This method can be used to get author details such as bio, website link, and profile image.

If you want to get all _quotes_ by a specific author, use the [/quotes](#list-quotes) endpoint and filter by author author name/slug.

If you want to get _multiple_ authors by slug in a single request, use the [/authors](#list-authors) endpoint and filter by `slug`.

```HTTP
GET /authors/:id
```

### Response

```ts
{
  /// A unique id for this author
  id: number
  // A brief, one paragraph bio of the author. Source: wiki API
  bio: string
  // A one-line description of the author. Typically it is the person's primary
  // occupation or what they are know for.
  description: string
  // The link to the author's wikipedia page or official website
  link: string
  // The authors full name
  name: string
  // A slug is a URL-friendly ID derived from the authors name. It can be used as
  // identifier for the author
  slug: string
  // The time the author was added to the database.
  createdAt: DateTime
  // The time the author was edited.
  updatedAt: DateTime
}
```

## Get Author By Slug

Get a _single_ `Author` by `slug`. This method can be used to get author details such as bio, website link, and profile image.

If you want to get all _quotes_ by a specific author, use the [/quotes](#list-quotes) endpoint and filter by author author name/slug.

If you want to get _multiple_ authors by slug in a single request, use the [/authors](#list-authors) endpoint and filter by `slug`.

```HTTP
GET /authors/slugs/:slug
```

### Response

```ts
{
  /// A unique id for this author
  id: number
  // A brief, one paragraph bio of the author. Source: wiki API
  bio: string
  // A one-line description of the author. Typically it is the person's primary
  // occupation or what they are know for.
  description: string
  // The link to the author's wikipedia page or official website
  link: string
  // The authors full name
  name: string
  // A slug is a URL-friendly ID derived from the authors name. It can be used as
  // identifier for the author
  slug: string
  // The time the author was added to the database.
  createdAt: DateTime
  // The time the author was edited.
  updatedAt: DateTime
}
```

## List Tags

```HTTP
GET /tags
```

Get a list of all tags

### Query parameters

| param  | type   | Description                                                                                                                                                                                                                                                       |
| :----- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sortBy | `enum` | `Default: "name"` &nbsp; `values: "createdAt", "updatedAt", "name"` <br> The field used to sort tags.                                                                                                                                                             |
| order  | `enum` | `values: "asc", "desc"` <br> The order in which results are sorted. The default order depends on the sortBy field. For string fields that are sorted alphabetically, the default order is ascending. For number and date fields, the default order is descending. |

### Response

```ts
{
  // The number of all tags by this request
  count: number
  // The array of tags
  data: Array<{
    id: number
    name: string
  }>
}
```
