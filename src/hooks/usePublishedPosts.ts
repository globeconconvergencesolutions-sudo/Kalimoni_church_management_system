import { useEffect, useState } from 'react'
import { fetchPublishedPosts } from '../lib/cms'
import { POSTS, type BlogPost } from '../data/blog'

export function usePublishedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(POSTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void fetchPublishedPosts().then(result => {
      setPosts(result.posts)
      setReady(true)
    })
  }, [])

  return { posts, ready }
}
