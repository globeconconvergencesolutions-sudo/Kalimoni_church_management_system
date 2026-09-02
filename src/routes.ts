import { createElement } from 'react'
import { createBrowserRouter } from 'react-router'
import RouteErrorPage from './components/RouteErrorPage'
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
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNotices from './pages/admin/AdminNotices'
import AdminNoticeForm from './pages/admin/AdminNoticeForm'
import AdminContent from './pages/admin/AdminContent'
import AdminEvents from './pages/admin/AdminEvents'
import AdminEventForm from './pages/admin/AdminEventForm'
import AdminPosts from './pages/admin/AdminPosts'
import AdminPostForm from './pages/admin/AdminPostForm'
import AdminMass from './pages/admin/AdminMass'
import AdminInbox from './pages/admin/AdminInbox'
import AdminMedia from './pages/admin/AdminMedia'
import AdminGiving from './pages/admin/AdminGiving'

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    Component: AdminLogin,
    errorElement: createElement(RouteErrorPage, { scope: 'office' }),
  },
  {
    path: '/admin',
    Component: AdminLayout,
    errorElement: createElement(RouteErrorPage, { scope: 'office' }),
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'notices', Component: AdminNotices },
      { path: 'notices/new', Component: AdminNoticeForm },
      { path: 'notices/:id', Component: AdminNoticeForm },
      { path: 'content', Component: AdminContent },
      { path: 'events', Component: AdminEvents },
      { path: 'events/new', Component: AdminEventForm },
      { path: 'events/:id', Component: AdminEventForm },
      { path: 'posts', Component: AdminPosts },
      { path: 'posts/new', Component: AdminPostForm },
      { path: 'posts/:id', Component: AdminPostForm },
      { path: 'mass', Component: AdminMass },
      { path: 'inbox', Component: AdminInbox },
      { path: 'media', Component: AdminMedia },
      { path: 'photos', Component: AdminMedia },
      { path: 'giving', Component: AdminGiving },
    ],
  },
  {
    path: '/',
    Component: Layout,
    errorElement: createElement(RouteErrorPage, { scope: 'public' }),
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
