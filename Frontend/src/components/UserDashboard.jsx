import { useState, useEffect } from "react";
import { Calendar, User, FileText, Download, Eye, X } from "lucide-react";

// Mock API service
const postAPI = {
  getAllPosts: async () => {
    // Simulate API call with mock data
    return [
      {
        _id: "1",
        title: "Welcome to Our Platform",
        content:
          "This is a sample post demonstrating the dashboard functionality. You can view posts, download attachments, and more!",
        authorName: "John Doe",
        createdAt: "2024-12-01T10:00:00Z",
        file: {
          filename: "welcome-guide.pdf",
        },
      },
      {
        _id: "2",
        title: "Important Announcement",
        content:
          "We're excited to announce new features coming soon. Stay tuned for updates and improvements to make your experience better.",
        authorName: "Jane Smith",
        createdAt: "2024-12-03T14:30:00Z",
        file: {
          filename: "announcement.jpg",
        },
      },
      {
        _id: "3",
        title: "Monthly Newsletter",
        content:
          "Check out what happened this month! We've made significant progress on several fronts and wanted to share our accomplishments with you.",
        authorName: "Admin Team",
        createdAt: "2024-12-05T09:00:00Z",
        file: null,
      },
    ];
  },
};

export default function UserDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await postAPI.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
      alert("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const handleDownloadFile = (postId, filename) => {
    // Mock download functionality
    alert(
      `Downloading ${filename}...\n\nIn a real app, this would download the file from the server.`
    );
  };

  const getFileIcon = (filename) => {
    if (!filename) return "📎";
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    return "📎";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Posts Dashboard
          </h1>
          <p className="text-gray-600">
            View all published posts and announcements
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading posts...</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No posts yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back later for new posts
            </p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {post.file && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                        <span className="text-base">
                          {getFileIcon(post.file.filename)}
                        </span>
                        <span className="truncate max-w-[150px]">
                          {post.file.filename}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewPost(post)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    {post.file && (
                      <button
                        onClick={() =>
                          handleDownloadFile(post._id, post.file.filename)
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPost.title}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {selectedPost.authorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedPost.createdAt)}</span>
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>

                {selectedPost.file && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {getFileIcon(selectedPost.file.filename)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedPost.file.filename}
                          </p>
                          <p className="text-xs text-gray-500">Attached file</p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleDownloadFile(
                            selectedPost._id,
                            selectedPost.file.filename
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
