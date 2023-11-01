// index.tsx
import Link from 'next/link'
import groq from 'groq'
import client from '../client'
import { InferGetStaticPropsType } from 'next'

const Index = ({posts}: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <div>
        <h1>Welcome to a blog!</h1>
        {posts.length > 0 && posts.map(
          ({ _id='', title = '', slug = {current: ''}, publishedAt = '' }) =>
            slug && (
              <li key={_id}>
                <Link href={`/post/${encodeURIComponent(slug.current)}`}>
                  {title}
                </Link>{' '}
                ({new Date(publishedAt).toDateString()})
              </li>
            )
        )}
      </div>
    )
}

export async function getStaticProps() {
    const posts = await client.fetch(groq`
      *[_type == "post" && publishedAt < now()] | order(publishedAt desc)
    `)
    return {
      props: {
        posts
      }
    }
}

export default Index;