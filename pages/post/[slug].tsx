// post.tsx
//add comment to refire
//import { useRouter } from 'next/router'
import groq from 'groq'
import client from '../../client'
import imageUrlBuilder from '@sanity/image-url'
import {PortableText} from '@portabletext/react'
import { InferGetStaticPropsType } from 'next'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { Key, ReactElement, JSXElementConstructor, ReactNode, PromiseLikeOfReactNode } from 'react'

function urlFor (source: SanityImageSource) {
  return imageUrlBuilder(client).image(source)
}

const ptComponents = {
  types: {
    image: ({ value={asset: {_ref:""}, alt: ""} }) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <img
          alt={value.alt || ' '}
          loading="lazy"
          src={urlFor(value).width(320).height(240).fit('max').auto('format').toString()}
        />
      )
    }
  }
}

const Post = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (!props.post){
    return (
      <div>Not found</div>
    )
  }
  //const router = useRouter()
  const { title = 'Missing title', name = 'Missing name', categories, authorImage, body = [] } = props.post
  return (
    <article>
      <h1>{title}</h1>
      <span>By {name}</span>
      {categories && (
        <ul>
          Posted in
          {categories.map((category: boolean | Key | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | PromiseLikeOfReactNode | null | undefined) => <li key={category?.toString()}>{category?.toString()}</li>)}
        </ul>
      )}
      {authorImage && (
        <div>
          <img
            src={urlFor(authorImage)
              .width(50)
              .url()}
          />
        </div>
      )}
      <PortableText
        value={body}
        components={ptComponents}
      />
    </article>
  )
}

const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  "name": author->name,
  "categories": categories[]->title,
  "authorImage": author->image,
  body
}`

export async function getStaticPaths() {
  const paths = await client.fetch(
    groq`*[_type == "post" && defined(slug.current)][].slug.current`
  )

  return {
    paths: paths.map((slug: string) => ({params: {slug}})),
    fallback: true,
  }
}

export async function getStaticProps(context: { params: { slug?: "" | undefined } }) {
  // It's important to default the slug so that it doesn't return "undefined"
  const { slug = "" } = context.params
  const post = await client.fetch(query, {slug})
  
  return {
    props: {
      post
    }
  }
}

export default Post