import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import { postAPI } from "./services/postApi";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LogOut, FileText, LayoutDashboard } from "lucide-react";

function Navbar() {
  const { logout, user } = useAuth();

  // Check if user is admin based on role
  const isAdmin = user?.user?.role === "admin";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              to="/admin/posts"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <FileText className="w-4 h-4" />
              Manage Posts
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user?.user?.name} ({isAdmin ? "Admin" : "User"})
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Check if user is admin
  const isAdmin = user?.user?.role === "admin";

  // Load Posts when authenticated
  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await postAPI.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostCreated = () => {
    loadPosts();
    setEditingPost(null);
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postAPI.deletePost(id);
      loadPosts();
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/dashboard" />}
      />

      {/* Dashboard - Different for Admin vs User */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar />
            {isAdmin ? <AdminDashboard /> : <UserDashboard />}
          </ProtectedRoute>
        }
      />

      {/* Admin Only - Manage Posts */}
      <Route
        path="/admin/posts"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      Post Management System
                    </h1>
                    <p className="text-gray-600">
                      Create and manage posts for all users
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PostForm
                      editingPost={editingPost}
                      onPostCreated={handlePostCreated}
                      onCancelEdit={() => setEditingPost(null)}
                    />

                    <PostList
                      posts={posts}
                      loading={loadingPosts}
                      onEdit={setEditingPost}
                      onDelete={handleDeletePost}
                      onRefresh={loadPosts}
                    />
                  </div>
                </div>
              </>
            ) : (
              <Navigate to="/dashboard" />
            )}
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
