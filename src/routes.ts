import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import History from './pages/History'
import Community from './pages/Community'
import Vincentians from './pages/Vincentians'
import Sisters from './pages/Sisters'
import Ministries from './pages/Ministries'
import Events from './pages/Events'
import Gallery from './pages/Gallery'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Donation from './pages/Donation'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'history', Component: History },
      { path: 'community', Component: Community },
      { path: 'vincentians', Component: Vincentians },
      { path: 'sisters', Component: Sisters },
      { path: 'ministries', Component: Ministries },
      { path: 'events', Component: Events },
      { path: 'gallery', Component: Gallery },
      { path: 'blog', Component: Blog },
      { path: 'blog/:slug', Component: BlogPost },
      { path: 'donate', Component: Donation },
      { path: 'contact', Component: Contact },
      { path: '*', Component: NotFound },
    ],
  },
])
